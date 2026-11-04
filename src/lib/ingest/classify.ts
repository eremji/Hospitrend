import { THEMES } from "@/lib/taxonomy";

/** Very common words that say little about the topic: they count less. */
const GENERIC = new Set([
  "hôtel", "hotel", "hôtelier", "hôtelière", "hotelier", "hotelero", "hotelera",
  "tourisme", "tourism", "turismo", "design", "technology", "technologie", "tecnología",
]);

const TITLE_WEIGHT = 2;
const BODY_WEIGHT = 1;
const GENERIC_FACTOR = 0.3;

interface CompiledKeyword {
  theme: string;
  weight: number;
  re: RegExp;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const COMPILED: CompiledKeyword[] = THEMES.flatMap((theme) =>
  theme.keywords
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
    .map((k) => ({
      theme: theme.slug,
      weight: GENERIC.has(k) ? GENERIC_FACTOR : 1,
      // Unicode-aware word boundaries, so "ota" does not match "total".
      re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(k)}(?![\\p{L}\\p{N}])`, "iu"),
    })),
);

export interface Classification {
  mainTheme: string;
  secondaryThemes: string[];
}

/**
 * Keyword classification used when no LLM classification is available.
 * Returns the best theme, up to 2 secondary themes, and falls back to the
 * source's default theme when nothing matches.
 */
export function classifyByKeywords(
  title: string,
  excerpt: string,
  fallbackTheme: string,
): Classification {
  const scores = new Map<string, number>();
  const t = title.toLowerCase();
  const b = excerpt.toLowerCase();

  for (const kw of COMPILED) {
    let s = 0;
    if (kw.re.test(t)) s += TITLE_WEIGHT * kw.weight;
    if (kw.re.test(b)) s += BODY_WEIGHT * kw.weight;
    if (s > 0) scores.set(kw.theme, (scores.get(kw.theme) ?? 0) + s);
  }

  // The source's own domain is a weak prior.
  scores.set(fallbackTheme, (scores.get(fallbackTheme) ?? 0) + 0.5);

  const ranked = [...scores.entries()].sort((a, b2) => b2[1] - a[1]);
  const [main, mainScore] = ranked[0];
  const secondaryThemes = ranked
    .slice(1)
    .filter(([, s]) => s >= 1 && s >= mainScore * 0.5)
    .slice(0, 2)
    .map(([slug]) => slug);

  return { mainTheme: main, secondaryThemes };
}
