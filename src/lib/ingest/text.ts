/** Text helpers for ingestion. Pure functions, covered by tests. */

const TRACKING_PARAMS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^mc_(cid|eid)$/i,
  /^xtor$/i,
  /^at_/i,
  /^_hs(enc|mi)$/i,
  /^ref$/i,
  /^cmpid$/i,
  /^ncid$/i,
  /^sr_share$/i,
];

/**
 * Normalises an article URL so that the same article is stored once
 * (SPEC US-21 CA1): lower-case host, no tracking parameters, no hash,
 * no trailing slash.
 */
export function normalizeUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return raw.trim();
  }
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((re) => re.test(key))) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) url.pathname = url.pathname.replace(/\/+$/, "");
  const out = url.toString();
  return url.pathname === "/" && !url.search ? out.replace(/\/$/, "") : out;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", laquo: "«", raquo: "»",
  ndash: "–", mdash: "—", eacute: "é", egrave: "è", ecirc: "ê", agrave: "à",
  acirc: "â", ccedil: "ç", ocirc: "ô", ucirc: "û", ugrave: "ù", icirc: "î",
  iuml: "ï", euml: "ë", ntilde: "ñ", aacute: "á", iacute: "í", oacute: "ó",
  uacute: "ú", Eacute: "É", Agrave: "À", euro: "€", deg: "°", oelig: "œ",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED_ENTITIES[code] ?? NAMED_ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Strips HTML tags and collapses whitespace. */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  const noBlocks = html
    .replace(/<(script|style|figure|figcaption)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h\d)>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(noBlocks).replace(/\s+/g, " ").trim();
}

/** Removes WordPress-style trailers such as "The post X appeared first on Y." or "[…]". */
export function cleanExcerpt(text: string): string {
  return text
    .replace(/\s*(The post|L’article|L'article|La entrada|El post)\s.+?(appeared first on|est apparu en premier sur|se publicó primero en|aparece primero en).*$/i, "")
    .replace(/\s*(\[(…|\.\.\.)\]|\[&#8230;\])\s*$/u, "…")
    .replace(/\s*(Lire la suite|Read more|Continue reading|Leer más|Seguir leyendo)\s*(»|→|\.\.\.|…)?\s*$/i, "")
    .trim();
}

/**
 * Keeps at most `max` sentences (SPEC US-04 CA4). Adds an ellipsis when the
 * text was cut, and hard-caps very long sentences.
 */
export function truncateSentences(text: string, max = 3, hardCap = 420): string {
  const t = text.trim();
  if (!t) return "";
  const sentences = t.match(/[^.!?…]+(?:[.!?…]+["»”’)]*|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [t];
  let out = sentences.slice(0, max).join(" ");
  const cut = sentences.length > max;
  if (out.length > hardCap) {
    out = out.slice(0, hardCap).replace(/\s+\S*$/, "") + "…";
  } else if (cut && !/[.!?…]$/.test(out)) {
    out += "…";
  }
  return out;
}

/** Google News titles end with " - Source name". */
export function stripSourceSuffix(title: string, sourceName?: string): string {
  const t = title.trim();
  if (sourceName) {
    const suffix = ` - ${sourceName}`;
    if (t.toLowerCase().endsWith(suffix.toLowerCase())) return t.slice(0, -suffix.length).trim();
  }
  return t.replace(/\s+[-–|]\s+[^-–|]{2,40}$/, "").trim() || t;
}

/** Normalised title used to spot near-duplicates (SPEC US-21 CA2). */
export function titleFingerprint(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
