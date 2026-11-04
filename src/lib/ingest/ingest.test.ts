import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SourceSeed } from "@/lib/sources";
import { collectSource, runIngestion, selectRecent, type ArticleInsert, type IngestDeps, type SourcePatch, type SourceRow } from "./ingest";

const fixture = (name: string) => readFileSync(join(__dirname, "__fixtures__", name), "utf8");
const NOW = new Date("2026-11-04T05:00:00Z");

function source(over: Partial<SourceRow> = {}): SourceRow {
  return {
    id: "s1",
    slug: "exemple",
    name: "Exemple",
    site_url: "https://www.exemple-tourisme.fr",
    feed_url: "https://www.exemple-tourisme.fr/feed",
    google_news_query: null,
    language: "fr",
    reliability: 2,
    default_theme: "hospitality",
    consecutive_failures: 0,
    ...over,
  };
}

function fakeDeps(pages: Record<string, string>, sources: SourceRow[], stored: string[] = []) {
  const inserted: ArticleInsert[] = [];
  const patches: Record<string, SourcePatch> = {};
  const fetched: string[] = [];
  let seeded = false;
  const deps: IngestDeps = {
    now: () => NOW,
    async fetchText(url) {
      fetched.push(url);
      if (url in pages) return pages[url];
      throw new Error("HTTP 404");
    },
    async seedSourcesIfEmpty() {
      seeded = true;
    },
    async listActiveSources() {
      return sources;
    },
    async knownUrls(urls) {
      return new Set(urls.filter((u) => stored.includes(u)));
    },
    async knownFingerprints() {
      return new Set();
    },
    async insertArticles(rows) {
      inserted.push(...rows);
      return rows.length;
    },
    async updateSource(id, patch) {
      patches[id] = patch;
    },
    async purgeOldArticles() {
      return 0;
    },
    async recordRun() {},
  };
  return { deps, inserted, patches, fetched, seeded: () => seeded };
}

describe("collectSource", () => {
  it("uses the configured feed first", async () => {
    const { deps } = fakeDeps({ "https://www.exemple-tourisme.fr/feed": fixture("wordpress.xml") }, []);
    const res = await collectSource(deps, source());
    expect(res.via).toBe("feed");
    expect(res.items).toHaveLength(2);
  });

  it("discovers the feed on the home page when the configured one fails", async () => {
    const { deps } = fakeDeps(
      {
        "https://www.exemple-tourisme.fr": '<link rel="alternate" type="application/rss+xml" href="/rss.xml">',
        "https://www.exemple-tourisme.fr/rss.xml": fixture("wordpress.xml"),
      },
      [],
    );
    const res = await collectSource(deps, source());
    expect(res.via).toBe("discovered");
    expect(res.feedUrl).toBe("https://www.exemple-tourisme.fr/rss.xml");
  });

  it("falls back to Google News restricted to the site", async () => {
    const { deps, fetched } = fakeDeps({}, []);
    deps.fetchText = async (url) => {
      fetched.push(url);
      if (url.startsWith("https://news.google.com/")) return fixture("googlenews.xml");
      throw new Error("HTTP 403");
    };
    const res = await collectSource(deps, source({ feed_url: null }));
    expect(res.via).toBe("google-news");
    expect(fetched.at(-1)).toContain("site%3Aexemple-tourisme.fr");
  });

  it("reports every attempt when all of them fail", async () => {
    const { deps } = fakeDeps({}, []);
    await expect(collectSource(deps, source())).rejects.toThrow(/flux : HTTP 404.*site : HTTP 404.*Google News : HTTP 404/);
  });
});

describe("selectRecent", () => {
  it("drops articles older than 7 days and keeps undated ones", () => {
    const items = [
      { url: "a", title: "a", excerpt: "", imageUrl: null, publishedAt: new Date("2026-11-03T00:00:00Z") },
      { url: "b", title: "b", excerpt: "", imageUrl: null, publishedAt: new Date("2026-10-20T00:00:00Z") },
      { url: "c", title: "c", excerpt: "", imageUrl: null, publishedAt: null },
      { url: "a", title: "a bis", excerpt: "", imageUrl: null, publishedAt: new Date("2026-11-03T00:00:00Z") },
    ];
    expect(selectRecent(items, NOW).map((i) => i.url)).toEqual(["c", "a"]);
  });
});

describe("runIngestion", () => {
  const seeds: SourceSeed[] = [];

  it("stores new articles with a theme and skips known URLs", async () => {
    const { deps, inserted, patches, seeded } = fakeDeps(
      { "https://www.exemple-tourisme.fr/feed": fixture("wordpress.xml") },
      [source()],
      ["https://www.exemple-tourisme.fr/sans-date"],
    );
    const report = await runIngestion(deps, seeds);
    expect(seeded()).toBe(true);
    expect(report.inserted).toBe(1);
    expect(inserted[0]).toMatchObject({
      source_id: "s1",
      url: "https://www.exemple-tourisme.fr/accor-lyon",
      language: "fr",
      main_theme: "hospitality",
    });
    expect(patches.s1).toMatchObject({ consecutive_failures: 0, last_via: "feed", last_error: null });
  });

  it("keeps going when one source fails, and counts its failures", async () => {
    const { deps, patches } = fakeDeps({ "https://www.exemple-tourisme.fr/feed": fixture("wordpress.xml") }, [
      source({ id: "broken", slug: "broken", site_url: "https://broken.example", feed_url: "https://broken.example/feed", consecutive_failures: 2 }),
      source(),
    ]);
    const report = await runIngestion(deps, seeds);
    expect(report.sources.find((s) => s.source === "broken")?.error).toBeTruthy();
    expect(report.inserted).toBe(2);
    expect(patches.broken.consecutive_failures).toBe(3);
  });

  it("skips duplicate titles within the same run", async () => {
    const { deps, inserted } = fakeDeps(
      {
        "https://a.example/feed": fixture("wordpress.xml"),
        "https://b.example/feed": fixture("wordpress.xml").replaceAll("exemple-tourisme.fr", "autre-site.fr"),
      },
      [
        source({ id: "a", slug: "a", site_url: "https://a.example", feed_url: "https://a.example/feed" }),
        source({ id: "b", slug: "b", site_url: "https://b.example", feed_url: "https://b.example/feed" }),
      ],
    );
    await runIngestion(deps, seeds);
    expect(inserted).toHaveLength(2);
  });
});
