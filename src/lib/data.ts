"use client";

import { startOfParisDay } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Article, Decision } from "@/lib/types";

/**
 * Browser-side data access. Every query runs with the signed-in user's
 * session, and Row Level Security limits interactions and saves to her own.
 */

type ArticleRow = Omit<Article, "source_name">;

let sourceNames: Promise<Map<string, string>> | null = null;

function loadSourceNames(): Promise<Map<string, string>> {
  sourceNames ??= (async () => {
    const { data, error } = await supabaseBrowser().from("sources").select("id, name");
    if (error) {
      sourceNames = null;
      throw error;
    }
    return new Map((data ?? []).map((s) => [s.id as string, s.name as string]));
  })();
  return sourceNames;
}

async function withSourceNames(rows: ArticleRow[]): Promise<Article[]> {
  const names = await loadSourceNames();
  return rows.map((r) => ({ ...r, source_name: names.get(r.source_id) ?? "Source" }));
}

const ARTICLE_COLUMNS =
  "id, source_id, url, title, excerpt, image_url, language, published_at, main_theme, secondary_themes, tags, summary_status, summary_short, summary_points, hotel_impact";

/** Next cards of the daily feed (articles never liked or disliked). */
export async function fetchFeed(limit: number): Promise<Article[]> {
  if (limit <= 0) return [];
  const { data, error } = await supabaseBrowser().rpc("get_feed", { p_limit: limit });
  if (error) throw error;
  return withSourceNames((data ?? []) as ArticleRow[]);
}

export interface TodayStats {
  processed: number;
  liked: number;
  saved: number;
}

/** Cards handled since midnight (Paris), for the "12 / 25" counter. */
export async function fetchTodayStats(): Promise<TodayStats> {
  const since = startOfParisDay();
  const { data, error } = await supabaseBrowser()
    .from("interactions")
    .select("type")
    .gte("created_at", since)
    .eq("undone", false)
    .in("type", ["like", "dislike", "save"]);
  if (error) throw error;
  const rows = data ?? [];
  return {
    processed: rows.filter((r) => r.type === "like" || r.type === "dislike").length,
    liked: rows.filter((r) => r.type === "like").length,
    saved: rows.filter((r) => r.type === "save").length,
  };
}

/** Records a like or dislike and returns its id, for undo. */
export async function recordDecision(articleId: string, type: Decision, afterOpen: boolean): Promise<number> {
  const { data, error } = await supabaseBrowser()
    .from("interactions")
    .insert({ article_id: articleId, type, after_open: afterOpen })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as number;
}

/** Undo (SPEC US-07 CA3): the interaction is kept but marked as undone. */
export async function undoDecision(interactionId: number): Promise<void> {
  const { error } = await supabaseBrowser().from("interactions").update({ undone: true }).eq("id", interactionId);
  if (error) throw error;
}

/** Detailed reading opened, with time spent (SPEC US-06 CA5). */
export async function recordOpen(articleId: string, durationMs: number): Promise<void> {
  const { error } = await supabaseBrowser()
    .from("interactions")
    .insert({ article_id: articleId, type: "open", duration_ms: Math.round(durationMs) });
  if (error) throw error;
}

export async function setSaved(articleId: string, saved: boolean): Promise<void> {
  const db = supabaseBrowser();
  if (saved) {
    const { error } = await db.from("saved_articles").upsert({ article_id: articleId }, { onConflict: "user_id,article_id", ignoreDuplicates: true });
    if (error) throw error;
  } else {
    const { error } = await db.from("saved_articles").delete().eq("article_id", articleId);
    if (error) throw error;
  }
  await db.from("interactions").insert({ article_id: articleId, type: saved ? "save" : "unsave" });
}

export async function fetchSavedIds(): Promise<Set<string>> {
  const { data, error } = await supabaseBrowser().from("saved_articles").select("article_id");
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.article_id as string));
}

export interface SavedArticle extends Article {
  saved_at: string;
}

/** Saved articles, most recent first (SPEC US-14 CA3). Saves outlive the 7-day feed limit. */
export async function fetchSaved(): Promise<SavedArticle[]> {
  const { data, error } = await supabaseBrowser()
    .from("saved_articles")
    .select(`created_at, articles (${ARTICLE_COLUMNS})`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []).flatMap((r) => {
    const a = r.articles as unknown as ArticleRow | null;
    return a ? [{ ...a, saved_at: r.created_at as string }] : [];
  });
  const withNames = await withSourceNames(rows);
  return withNames.map((a, i) => ({ ...a, saved_at: rows[i].saved_at }));
}

export async function fetchArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabaseBrowser().from("articles").select(ARTICLE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [a] = await withSourceNames([data as ArticleRow]);
  return a;
}
