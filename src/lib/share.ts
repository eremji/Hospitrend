"use client";

import { truncateSentences } from "@/lib/ingest/text";
import type { Article } from "@/lib/types";

/**
 * Shares the original article link, never a Hospitrend link (SPEC US-16).
 * Uses the phone's share menu, or copies the text on desktop browsers.
 */
export async function shareArticle(a: Article): Promise<"shared" | "copied" | "cancelled"> {
  const summary = truncateSentences(a.summary_short || a.excerpt, 3);
  const text = [a.title, summary].filter(Boolean).join("\n\n");
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: a.title, text, url: a.url });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    }
  }
  await navigator.clipboard.writeText(`${text}\n\n${a.url}`);
  return "copied";
}
