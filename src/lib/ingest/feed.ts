import Parser from "rss-parser";
import { cleanExcerpt, htmlToText, normalizeUrl, stripSourceSuffix, truncateSentences } from "./text";

/** One article as read from a feed, before storage. */
export interface FeedItem {
  url: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: Date | null;
}

type MediaNode = { $?: { url?: string; medium?: string; type?: string } };

type RawItem = Parser.Item & {
  "media:content"?: MediaNode | MediaNode[];
  "media:thumbnail"?: MediaNode | MediaNode[];
  "content:encoded"?: string;
  description?: string;
  summary?: string;
};

const parser: Parser<Record<string, unknown>, RawItem> = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
      "content:encoded",
      "description",
      "summary",
    ],
  },
});

function firstMediaUrl(node: MediaNode | MediaNode[] | undefined): string | null {
  if (!node) return null;
  const list = Array.isArray(node) ? node : [node];
  for (const m of list) {
    const url = m?.$?.url;
    const isImage = !m?.$?.medium || m.$.medium === "image" || (m.$.type ?? "").startsWith("image/");
    if (url && isImage) return url;
  }
  return null;
}

function firstImgInHtml(html: string | undefined): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function absolute(url: string | null, base: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export interface ParseOptions {
  /** Base URL used to resolve relative links and images. */
  baseUrl: string;
  /** True for Google News feeds: titles carry the source name, descriptions are only links. */
  googleNews?: boolean;
  sourceName?: string;
}

/** Parses an RSS or Atom document into normalised items. Throws on invalid XML. */
export async function parseFeed(xml: string, opts: ParseOptions): Promise<FeedItem[]> {
  const feed = await parser.parseString(xml);
  const items: FeedItem[] = [];
  for (const raw of feed.items ?? []) {
    const link = raw.link ?? raw.guid;
    const rawTitle = htmlToText(raw.title);
    if (!link || !rawTitle) continue;
    const url = absolute(link, opts.baseUrl);
    if (!url) continue;

    const html = raw["content:encoded"] ?? raw.content ?? raw.description ?? raw.summary ?? "";
    const text = opts.googleNews ? "" : cleanExcerpt(htmlToText(raw.contentSnippet || raw.summary || raw.description || html));
    const image =
      firstMediaUrl(raw["media:content"]) ??
      firstMediaUrl(raw["media:thumbnail"]) ??
      (raw.enclosure?.url && (raw.enclosure.type ?? "image/").startsWith("image/") ? raw.enclosure.url : null) ??
      firstImgInHtml(html);

    const dateStr = raw.isoDate ?? raw.pubDate;
    const date = dateStr ? new Date(dateStr) : null;

    items.push({
      url: opts.googleNews ? url : normalizeUrl(url),
      title: opts.googleNews ? stripSourceSuffix(rawTitle, opts.sourceName) : rawTitle,
      excerpt: truncateSentences(text, 5, 700),
      imageUrl: absolute(image, url),
      publishedAt: date && !Number.isNaN(date.getTime()) ? date : null,
    });
  }
  return items;
}

/** Finds RSS/Atom feeds advertised in an HTML page (<link rel="alternate">). */
export function discoverFeedLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const re = /<link\b[^>]*>/gi;
  for (const tag of html.match(re) ?? []) {
    if (!/rel=["']?alternate/i.test(tag)) continue;
    if (!/type=["']?application\/(rss|atom)\+xml/i.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    const abs = href ? absolute(href, baseUrl) : null;
    if (abs && !/comments/i.test(abs)) links.push(abs);
  }
  return [...new Set(links)];
}

const GN_LOCALES = {
  fr: "hl=fr&gl=FR&ceid=FR:fr",
  en: "hl=en-US&gl=US&ceid=US:en",
  es: "hl=es&gl=ES&ceid=ES:es",
} as const;

/** Google News RSS search URL, limited to the last 7 days. */
export function googleNewsUrl(query: string, language: keyof typeof GN_LOCALES): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:7d`)}&${GN_LOCALES[language]}`;
}
