import { describe, expect, it } from "vitest";
import { cleanExcerpt, htmlToText, normalizeUrl, stripSourceSuffix, titleFingerprint, truncateSentences } from "./text";

describe("normalizeUrl", () => {
  it("removes tracking parameters, hash and trailing slash", () => {
    expect(normalizeUrl("https://WWW.Site.com/article/?utm_source=rss&utm_medium=x&id=3#top")).toBe(
      "https://www.site.com/article?id=3",
    );
  });
  it("treats two tracking variants of the same article as one URL", () => {
    expect(normalizeUrl("https://site.com/a?fbclid=123")).toBe(normalizeUrl("https://site.com/a/?gclid=9"));
  });
  it("keeps meaningful parameters in a stable order", () => {
    expect(normalizeUrl("https://site.com/a?b=2&a=1")).toBe("https://site.com/a?a=1&b=2");
  });
  it("returns invalid input unchanged", () => {
    expect(normalizeUrl(" not a url ")).toBe("not a url");
  });
});

describe("htmlToText", () => {
  it("strips tags and decodes entities", () => {
    expect(htmlToText("<p>L&rsquo;h&ocirc;tel&nbsp;<b>ouvre</b></p><p>demain &#8211; &#x2014;</p>")).toBe(
      "L’hôtel ouvre demain – —",
    );
  });
  it("handles empty input", () => {
    expect(htmlToText(undefined)).toBe("");
  });
});

describe("cleanExcerpt", () => {
  it("removes WordPress trailers", () => {
    expect(cleanExcerpt("Une phrase. The post Titre appeared first on Site.")).toBe("Une phrase.");
    expect(cleanExcerpt("Une phrase. L'article Titre est apparu en premier sur Site.")).toBe("Une phrase.");
    expect(cleanExcerpt("Une phrase [&hellip;] Lire la suite")).toBe("Une phrase [&hellip;]");
  });
});

describe("truncateSentences", () => {
  it("keeps at most three sentences", () => {
    expect(truncateSentences("Un. Deux ! Trois ? Quatre.")).toBe("Un. Deux ! Trois ?");
  });
  it("keeps short text as is", () => {
    expect(truncateSentences("Une seule phrase sans point")).toBe("Une seule phrase sans point");
  });
  it("hard-caps a very long sentence", () => {
    const long = "mot ".repeat(200);
    const out = truncateSentences(long, 3, 100);
    expect(out.length).toBeLessThanOrEqual(101);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("stripSourceSuffix", () => {
  it("removes the source name added by Google News", () => {
    expect(stripSourceSuffix("La taxe de séjour augmente - TourMaG", "TourMaG")).toBe("La taxe de séjour augmente");
  });
});

describe("titleFingerprint", () => {
  it("ignores case, accents and punctuation", () => {
    expect(titleFingerprint("Hôtel : l'ouverture d'Accor !")).toBe(titleFingerprint("hotel l ouverture d accor"));
  });
});
