import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { discoverFeedLinks, googleNewsUrl, parseFeed } from "./feed";

const fixture = (name: string) => readFileSync(join(__dirname, "__fixtures__", name), "utf8");

describe("parseFeed", () => {
  it("parses a WordPress RSS feed", async () => {
    const items = await parseFeed(fixture("wordpress.xml"), { baseUrl: "https://www.exemple-tourisme.fr" });
    expect(items).toHaveLength(2); // the item without title is skipped
    const [first, second] = items;
    expect(first.title).toBe("Accor ouvre un hôtel lifestyle à Lyon – 120 chambres");
    expect(first.url).toBe("https://www.exemple-tourisme.fr/accor-lyon");
    expect(first.excerpt).toBe("Le groupe ouvre un nouvel établissement. Il compte 120 chambres. Un rooftop est prévu. Le spa ouvrira en 2027.");
    expect(first.imageUrl).toBe("https://www.exemple-tourisme.fr/wp-content/uploads/lyon.jpg");
    expect(first.publishedAt?.toISOString()).toBe("2026-11-03T08:00:00.000Z");
    expect(second.publishedAt).toBeNull();
    expect(second.imageUrl).toBe("https://cdn.exemple.fr/img.jpg");
  });

  it("parses an Atom feed", async () => {
    const [item] = await parseFeed(fixture("atom.xml"), { baseUrl: "https://news.example.com" });
    expect(item.title).toBe("Airbnb raises host fees in Europe");
    expect(item.url).toBe("https://news.example.com/airbnb-fees");
    expect(item.excerpt).toBe("The platform changes its commission. Hosts react.");
  });

  it("parses Google News: strips the source name and drops the link-only description", async () => {
    const [item] = await parseFeed(fixture("googlenews.xml"), {
      baseUrl: "https://www.tourmag.com",
      googleNews: true,
      sourceName: "TourMaG",
    });
    expect(item.title).toBe("La taxe de séjour augmente à Paris");
    expect(item.excerpt).toBe("");
    expect(item.url).toContain("news.google.com");
  });

  it("rejects invalid XML", async () => {
    await expect(parseFeed("<html>not a feed", { baseUrl: "https://x.fr" })).rejects.toThrow();
  });
});

describe("discoverFeedLinks", () => {
  it("finds RSS and Atom links and skips comment feeds", () => {
    const html = `<head>
      <link rel="alternate" type="application/rss+xml" title="Flux" href="/feed/" />
      <link rel="alternate" type="application/rss+xml" title="Commentaires" href="/comments/feed/" />
      <link type="application/atom+xml" rel="alternate" href="https://cdn.site.fr/atom.xml">
      <link rel="stylesheet" href="/style.css">
    </head>`;
    expect(discoverFeedLinks(html, "https://www.site.fr")).toEqual([
      "https://www.site.fr/feed/",
      "https://cdn.site.fr/atom.xml",
    ]);
  });
});

describe("googleNewsUrl", () => {
  it("builds a localised 7-day search", () => {
    const url = googleNewsUrl("site:hosteltur.com", "es");
    expect(url).toContain("q=site%3Ahosteltur.com%20when%3A7d");
    expect(url).toContain("hl=es&gl=ES&ceid=ES:es");
  });
});
