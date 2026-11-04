"use client";

import { startOfParisDay } from "@/lib/format";
import {
  enqueue,
  flushQueue,
  isNetworkError,
  readQueue,
  removeQueued,
  type KeyValueStore,
  type QueuedOp,
  type SendResult,
} from "@/lib/offlineQueue";
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

/** Next cards of the daily feed (articles never liked or disliked, including choices still waiting offline). */
export async function fetchFeed(limit: number): Promise<Article[]> {
  if (limit <= 0) return [];
  const pending = pendingDecisionArticleIds();
  const { data, error } = await supabaseBrowser().rpc("get_feed", { p_limit: limit + pending.size });
  if (error) throw error;
  const rows = ((data ?? []) as ArticleRow[]).filter((r) => !pending.has(r.id)).slice(0, limit);
  return withSourceNames(rows);
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

// ---------------------------------------------------------------------------
// Writes. Each one is sent at once when possible, otherwise kept in the
// offline queue and sent when the network is back (SPEC US-05 CA5).
// ---------------------------------------------------------------------------

function storage(): KeyValueStore | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function online(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

function newLocalId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type Sent = SendResult & { error?: unknown };

function failed(error: unknown): Sent {
  return { ok: false, retry: isNetworkError(error, online()), error };
}

async function send(op: QueuedOp): Promise<Sent> {
  const db = supabaseBrowser();
  try {
    switch (op.kind) {
      case "decision": {
        const { data, error } = await db
          .from("interactions")
          .insert({ article_id: op.articleId, type: op.type, after_open: op.afterOpen, created_at: op.createdAt })
          .select("id")
          .single();
        return error ? failed(error) : { ok: true, interactionId: data.id as number };
      }
      case "undo": {
        const { error } = await db.from("interactions").update({ undone: true }).eq("id", op.interactionId);
        return error ? failed(error) : { ok: true };
      }
      case "open": {
        const { error } = await db
          .from("interactions")
          .insert({ article_id: op.articleId, type: "open", duration_ms: Math.round(op.durationMs), created_at: op.createdAt });
        return error ? failed(error) : { ok: true };
      }
      case "save": {
        const { error } = op.saved
          ? await db
              .from("saved_articles")
              .upsert({ article_id: op.articleId, created_at: op.createdAt }, { onConflict: "user_id,article_id", ignoreDuplicates: true })
          : await db.from("saved_articles").delete().eq("article_id", op.articleId);
        if (error) return failed(error);
        const { error: logError } = await db
          .from("interactions")
          .insert({ article_id: op.articleId, type: op.saved ? "save" : "unsave", created_at: op.createdAt });
        if (logError) console.error("[data] save interaction not recorded", logError);
        return { ok: true };
      }
    }
  } catch (e) {
    return failed(e);
  }
}

/** Server ids of decisions sent from the queue, by local id, so they can still be undone. */
const sentFromQueue = new Map<string, number>();
let flushing: Promise<void> | null = null;

/** Sends what the offline queue holds. Safe to call often: runs one at a time. */
export function flushOfflineQueue(): Promise<void> {
  flushing ??= flushQueue(storage(), send)
    .then((ids) => ids.forEach((id, localId) => sentFromQueue.set(localId, id)))
    .catch((e) => console.error("[data] offline queue", e))
    .finally(() => {
      flushing = null;
    });
  return flushing;
}

// Sends waiting choices when the network comes back, and when the app opens.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => void flushOfflineQueue());
  if (online() && readQueue(storage()).length > 0) void flushOfflineQueue();
}

/** Number of choices still waiting for the network. */
export function pendingCount(): number {
  return readQueue(storage()).length;
}

function pendingDecisionArticleIds(): Set<string> {
  const ids = new Set<string>();
  for (const { op } of readQueue(storage())) if (op.kind === "decision") ids.add(op.articleId);
  return ids;
}

/**
 * Sends `op` now, or queues it when the network is down or older operations
 * are still waiting (to keep the order). Throws when the server refuses it.
 */
async function sendOrQueue(op: QueuedOp): Promise<{ queued: false; interactionId?: number } | { queued: true; localId: string }> {
  const store = storage();
  if (readQueue(store).length === 0 && online()) {
    const r = await send(op);
    if (r.ok) return { queued: false, interactionId: r.interactionId };
    if (!r.retry) throw r.error;
  }
  const localId = newLocalId();
  enqueue(store, op, localId);
  if (online()) void flushOfflineQueue();
  return { queued: true, localId };
}

/** How to undo a decision: its server id, or its place in the offline queue. */
export type DecisionRef = { interactionId: number } | { localId: string };

/** Records a like or dislike. `queued` is true when it waits for the network. */
export async function recordDecision(
  articleId: string,
  type: Decision,
  afterOpen: boolean,
): Promise<{ ref: DecisionRef; queued: boolean }> {
  const r = await sendOrQueue({ kind: "decision", articleId, type, afterOpen, createdAt: new Date().toISOString() });
  if (r.queued) return { ref: { localId: r.localId }, queued: true };
  return { ref: { interactionId: r.interactionId! }, queued: false };
}

/** Undo (SPEC US-07 CA3): the interaction is kept but marked as undone, or simply dropped if it was never sent. */
export async function undoDecision(ref: DecisionRef): Promise<void> {
  let interactionId: number | undefined;
  if ("localId" in ref) {
    if (removeQueued(storage(), ref.localId)) return;
    interactionId = sentFromQueue.get(ref.localId);
    if (interactionId === undefined) throw new Error("decision not found");
  } else {
    interactionId = ref.interactionId;
  }
  await sendOrQueue({ kind: "undo", interactionId });
}

/** Detailed reading opened, with time spent (SPEC US-06 CA5). */
export async function recordOpen(articleId: string, durationMs: number): Promise<void> {
  await sendOrQueue({ kind: "open", articleId, durationMs, createdAt: new Date().toISOString() });
}

/** Adds or removes a favourite. Returns true when it waits for the network. */
export async function setSaved(articleId: string, saved: boolean): Promise<boolean> {
  const r = await sendOrQueue({ kind: "save", articleId, saved, createdAt: new Date().toISOString() });
  return r.queued;
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
