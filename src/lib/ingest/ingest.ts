import type { Language, SourceSeed } from "@/lib/sources";
import { classifyByKeywords } from "./classify";
import { discoverFeedLinks, googleNewsUrl, parseFeed, type FeedItem } from "./feed";
import { titleFingerprint } from "./text";

export const MAX_ARTICLE_AGE_DAYS = 7;
export const MAX_ITEMS_PER_SOURCE = 30;
/**
 * No new source is started after this much time, so the run always ends in
 * time to purge and write its log (Vercel stops the function at 300 s; one
 * source takes at most 6 fetches of 8 s).
 */
export const DEFAULT_TIME_BUDGET_MS = 240_000;
export const SKIPPED_FOR_TIME = "non collectée : temps limite de la collecte atteint";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface SourceRow {
  id: string;
  slug: string;
  name: string;
  site_url: string;
  feed_url: string | null;
  google_news_query: string | null;
  language: Language;
  reliability: number;
  default_theme: string;
  consecutive_failures: number;
}

export interface ArticleInsert {
  source_id: string;
  url: string;
  title: string;
  title_fingerprint: string;
  excerpt: string;
  image_url: string | null;
  language: Language;
  published_at: string;
  main_theme: string;
  secondary_themes: string[];
}

export interface SourcePatch {
  feed_url?: string;
  last_success_at?: string;
  last_error?: string | null;
  last_error_at?: string;
  consecutive_failures?: number;
  last_via?: CollectVia;
}

export type CollectVia = "feed" | "discovered" | "google-news";

export interface SourceReport {
  source: string;
  via?: CollectVia;
  fetched: number;
  inserted: number;
  error?: string;
  /** True when the time budget ran out before this source was started. */
  skipped?: boolean;
}

export interface RunReport {
  startedAt: string;
  finishedAt: string;
  inserted: number;
  purged: number;
  sources: SourceReport[];
  /** Set when the purge failed: the run is still logged. */
  purgeError?: string;
}

export interface RunOptions {
  /** Time after which no new source is started (default DEFAULT_TIME_BUDGET_MS). */
  timeBudgetMs?: number;
}

/** Everything ingestion needs from the outside world, injected for tests. */
export interface IngestDeps {
  fetchText(url: string): Promise<string>;
  seedSourcesIfEmpty(seeds: SourceSeed[]): Promise<void>;
  listActiveSources(): Promise<SourceRow[]>;
  /** Returns the subset of `urls` already stored. */
  knownUrls(urls: string[]): Promise<Set<string>>;
  /** Returns the subset of fingerprints stored for articles published since `since`. */
  knownFingerprints(fingerprints: string[], since: Date): Promise<Set<string>>;
  insertArticles(rows: ArticleInsert[]): Promise<number>;
  updateSource(id: string, patch: SourcePatch): Promise<void>;
  purgeOldArticles(): Promise<number>;
  recordRun(report: RunReport): Promise<void>;
  now(): Date;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function tryFeed(deps: IngestDeps, url: string, src: SourceRow, googleNews = false): Promise<FeedItem[]> {
  const xml = await deps.fetchText(url);
  return parseFeed(xml, { baseUrl: src.site_url, googleNews, sourceName: src.name });
}

function short(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.length > 140 ? `${msg.slice(0, 140)}…` : msg;
}

/**
 * Collects one source: its feed, else a feed found on its home page,
 * else Google News restricted to its domain (SPEC US-19 CA1).
 */
export async function collectSource(
  deps: IngestDeps,
  src: SourceRow,
): Promise<{ items: FeedItem[]; via: CollectVia; feedUrl?: string; notes: string[] }> {
  const notes: string[] = [];

  if (src.feed_url) {
    try {
      const items = await tryFeed(deps, src.feed_url, src);
      if (items.length > 0) return { items, via: "feed", notes };
      notes.push("flux vide");
    } catch (e) {
      notes.push(`flux : ${short(e)}`);
    }
  }

  try {
    const html = await deps.fetchText(src.site_url);
    const candidates = discoverFeedLinks(html, src.site_url).filter((u) => u !== src.feed_url).slice(0, 3);
    for (const candidate of candidates) {
      try {
        const items = await tryFeed(deps, candidate, src);
        if (items.length > 0) return { items, via: "discovered", feedUrl: candidate, notes };
      } catch {
        // try the next candidate
      }
    }
    if (candidates.length === 0) notes.push("aucun flux annoncé sur le site");
  } catch (e) {
    notes.push(`site : ${short(e)}`);
  }

  const query = src.google_news_query || `site:${domainOf(src.site_url)}`;
  try {
    const items = await tryFeed(deps, googleNewsUrl(query, src.language), src, true);
    if (items.length > 0) return { items, via: "google-news", notes };
    notes.push("Google News : aucun article");
  } catch (e) {
    notes.push(`Google News : ${short(e)}`);
  }

  throw new Error(notes.join(" ; "));
}

/** Keeps recent items, newest first, capped per source (SPEC US-19 CA3). */
export function selectRecent(items: FeedItem[], now: Date): FeedItem[] {
  const oldest = now.getTime() - MAX_ARTICLE_AGE_DAYS * DAY_MS;
  const future = now.getTime() + DAY_MS; // tolerate clock skew, reject absurd dates
  const seen = new Set<string>();
  return items
    .filter((i) => {
      const t = (i.publishedAt ?? now).getTime();
      return t >= oldest && t <= future;
    })
    .filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)))
    .sort((a, b) => (b.publishedAt ?? now).getTime() - (a.publishedAt ?? now).getTime())
    .slice(0, MAX_ITEMS_PER_SOURCE);
}

async function mapWithConcurrency<T, R>(list: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let next = 0;
  async function worker() {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker));
  return out;
}

/** Daily ingestion run. One failing source never stops the others (SPEC US-19 CA4). */
export async function runIngestion(deps: IngestDeps, seeds: SourceSeed[], opts: RunOptions = {}): Promise<RunReport> {
  const startedAt = deps.now();
  const deadline = startedAt.getTime() + (opts.timeBudgetMs ?? DEFAULT_TIME_BUDGET_MS);
  await deps.seedSourcesIfEmpty(seeds);
  const sources = await deps.listActiveSources();
  // Titles stored during this run, shared by all sources.
  const runFp = new Set<string>();

  const reports = await mapWithConcurrency(sources, 6, async (src): Promise<SourceReport> => {
    const now = deps.now();
    if (now.getTime() > deadline) {
      // Not a failure of the source: its failure counter is left alone.
      return { source: src.slug, fetched: 0, inserted: 0, error: SKIPPED_FOR_TIME, skipped: true };
    }
    try {
      const { items, via, feedUrl, notes } = await collectSource(deps, src);
      const recent = selectRecent(items, now);

      const known = await deps.knownUrls(recent.map((i) => i.url));
      let fresh = recent.filter((i) => !known.has(i.url));

      // Same title already stored in the last 72 h: same story (SPEC US-21 CA2, exact match only for now).
      const withFp = fresh.map((i) => ({ item: i, fp: titleFingerprint(i.title) }));
      const knownFp = await deps.knownFingerprints(
        withFp.map((x) => x.fp),
        new Date(now.getTime() - 3 * DAY_MS),
      );
      fresh = withFp
        .filter(({ fp }) => !knownFp.has(fp) && !runFp.has(fp) && (runFp.add(fp), true))
        .map(({ item }) => item);

      const rows: ArticleInsert[] = fresh.map((i) => {
        const c = classifyByKeywords(i.title, i.excerpt, src.default_theme);
        return {
          source_id: src.id,
          url: i.url,
          title: i.title,
          title_fingerprint: titleFingerprint(i.title),
          excerpt: i.excerpt,
          image_url: i.imageUrl,
          language: src.language,
          published_at: (i.publishedAt ?? now).toISOString(),
          main_theme: c.mainTheme,
          secondary_themes: c.secondaryThemes,
        };
      });
      const inserted = rows.length > 0 ? await deps.insertArticles(rows) : 0;

      await deps.updateSource(src.id, {
        last_success_at: now.toISOString(),
        consecutive_failures: 0,
        last_error: notes.length > 0 ? notes.join(" ; ") : null,
        last_via: via,
        ...(feedUrl ? { feed_url: feedUrl } : {}),
      });
      return { source: src.slug, via, fetched: items.length, inserted };
    } catch (e) {
      const error = (e instanceof Error ? e.message : String(e)).slice(0, 600);
      await deps.updateSource(src.id, {
        last_error: error,
        last_error_at: now.toISOString(),
        consecutive_failures: src.consecutive_failures + 1,
      });
      return { source: src.slug, fetched: 0, inserted: 0, error };
    }
  });

  let purged = 0;
  let purgeError: string | undefined;
  try {
    purged = await deps.purgeOldArticles();
  } catch (e) {
    purgeError = short(e);
  }
  const report: RunReport = {
    startedAt: startedAt.toISOString(),
    finishedAt: deps.now().toISOString(),
    inserted: reports.reduce((n, r) => n + r.inserted, 0),
    purged,
    sources: reports,
    ...(purgeError ? { purgeError } : {}),
  };
  await deps.recordRun(report);
  return report;
}
