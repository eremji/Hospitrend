import type { SupabaseClient } from "@supabase/supabase-js";
import type { SourceSeed } from "@/lib/sources";
import type { IngestDeps, SourceRow } from "./ingest";

const USER_AGENT = "Mozilla/5.0 (compatible; HospitrendBot/0.1; +https://github.com/eremji/Hospitrend)";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 3_000_000;

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text.length > MAX_BYTES ? text.slice(0, MAX_BYTES) : text;
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Ingestion dependencies backed by Supabase (secret key, server only). */
export function supabaseIngestDeps(db: SupabaseClient): IngestDeps {
  return {
    fetchText,
    now: () => new Date(),

    async seedSourcesIfEmpty(seeds: SourceSeed[]) {
      const { count, error } = await db.from("sources").select("id", { count: "exact", head: true });
      if (error) throw error;
      if ((count ?? 0) > 0) return;
      const { error: insertError } = await db.from("sources").insert(
        seeds.map((s) => ({
          slug: s.slug,
          name: s.name,
          site_url: s.siteUrl,
          feed_url: s.feedUrl,
          google_news_query: s.googleNewsQuery ?? null,
          language: s.language,
          reliability: s.reliability,
          priority: s.priority,
          default_theme: s.defaultTheme,
        })),
      );
      if (insertError) throw insertError;
    },

    async listActiveSources() {
      const { data, error } = await db
        .from("sources")
        .select("id, slug, name, site_url, feed_url, google_news_query, language, reliability, default_theme, consecutive_failures")
        .eq("active", true);
      if (error) throw error;
      return (data ?? []) as SourceRow[];
    },

    async knownUrls(urls) {
      const known = new Set<string>();
      for (const part of chunk(urls, 100)) {
        if (part.length === 0) continue;
        const { data, error } = await db.from("articles").select("url").in("url", part);
        if (error) throw error;
        data?.forEach((r) => known.add(r.url as string));
      }
      return known;
    },

    async knownFingerprints(fingerprints, since) {
      const known = new Set<string>();
      for (const part of chunk([...new Set(fingerprints)], 100)) {
        if (part.length === 0) continue;
        const { data, error } = await db
          .from("articles")
          .select("title_fingerprint")
          .in("title_fingerprint", part)
          .gte("published_at", since.toISOString());
        if (error) throw error;
        data?.forEach((r) => known.add(r.title_fingerprint as string));
      }
      return known;
    },

    async insertArticles(rows) {
      // ignoreDuplicates: two sources racing on the same URL must not fail the run.
      const { data, error } = await db
        .from("articles")
        .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
        .select("id");
      if (error) throw error;
      return data?.length ?? 0;
    },

    async updateSource(id, patch) {
      const { error } = await db.from("sources").update(patch).eq("id", id);
      if (error) throw error;
    },

    async purgeOldArticles() {
      const { data, error } = await db.rpc("purge_old_articles");
      if (error) throw error;
      return (data as number) ?? 0;
    },

    async recordRun(report) {
      const { error } = await db.from("ingest_runs").insert({
        started_at: report.startedAt,
        finished_at: report.finishedAt,
        inserted: report.inserted,
        purged: report.purged,
        report,
      });
      if (error) throw error;
    },
  };
}
