import type { Language } from "@/lib/sources";

const LANGUAGE_LABELS: Record<Language, string> = {
  fr: "en français",
  en: "en anglais",
  es: "en espagnol",
};

export function languageLabel(lang: Language): string {
  return LANGUAGE_LABELS[lang] ?? "";
}

/** "à l'instant", "il y a 3 h", "hier", "il y a 4 j" (SPEC US-04 CA1). */
export function relativeDate(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  return `il y a ${days} j`;
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export function fullDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso)).replace(":", " h ");
}

/** Start of the current day in Paris, as an ISO string (the daily feed resets at midnight). */
export function startOfParisDay(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD
  // Paris is UTC+1 or UTC+2: compute the offset for that date.
  const probe = new Date(`${parts}T12:00:00Z`);
  const parisNoon = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(probe);
  const offsetHours = Number(parisNoon) - 12;
  return new Date(new Date(`${parts}T00:00:00Z`).getTime() - offsetHours * 3_600_000).toISOString();
}
