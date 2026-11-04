/**
 * Offline queue (SPEC US-05 CA5): a choice made without network is kept on the
 * phone and sent as soon as the network is back. Pure logic, covered by tests;
 * the browser wiring is in `src/lib/data.ts`.
 */

export type QueuedOp =
  | { kind: "decision"; articleId: string; type: "like" | "dislike"; afterOpen: boolean; createdAt: string }
  | { kind: "undo"; interactionId: number }
  | { kind: "open"; articleId: string; durationMs: number; createdAt: string }
  | { kind: "save"; articleId: string; saved: boolean; createdAt: string };

export interface QueuedItem {
  localId: string;
  op: QueuedOp;
}

/** The part of `localStorage` the queue needs (injected for tests). */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Result of sending one operation to the server. */
export type SendResult = { ok: true; interactionId?: number } | { ok: false; retry: boolean };

export const QUEUE_KEY = "ht-offline-queue";

/** Stays empty, without failing, when storage is unavailable (private mode). */
export function readQueue(store: KeyValueStore | null): QueuedItem[] {
  if (!store) return [];
  try {
    const raw = store.getItem(QUEUE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as QueuedItem[]) : [];
  } catch {
    return [];
  }
}

export function writeQueue(store: KeyValueStore | null, items: QueuedItem[]): void {
  if (!store) return;
  try {
    store.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the choice is lost, as without the queue.
  }
}

export function enqueue(store: KeyValueStore | null, op: QueuedOp, localId: string): QueuedItem {
  const item = { localId, op };
  writeQueue(store, [...readQueue(store), item]);
  return item;
}

/** Removes a queued item. Returns false when it is no longer in the queue (already sent). */
export function removeQueued(store: KeyValueStore | null, localId: string): boolean {
  const items = readQueue(store);
  const rest = items.filter((i) => i.localId !== localId);
  if (rest.length === items.length) return false;
  writeQueue(store, rest);
  return true;
}

/**
 * Sends the queued operations in order. Stops at the first network failure
 * and keeps the rest for later. An operation the server refuses for good
 * (article purged, access removed) is dropped so it does not block the queue.
 * Returns the server id of each decision sent, by local id, for undo.
 */
export async function flushQueue(
  store: KeyValueStore | null,
  send: (op: QueuedOp) => Promise<SendResult>,
): Promise<Map<string, number>> {
  const sentIds = new Map<string, number>();
  for (const item of readQueue(store)) {
    const result = await send(item.op);
    if (!result.ok && result.retry) break;
    if (result.ok && result.interactionId !== undefined) sentIds.set(item.localId, result.interactionId);
    removeQueued(store, item.localId);
  }
  return sentIds;
}

/**
 * True when a Supabase call failed because the network is down, not because
 * the server refused it. supabase-js reports a failed fetch as an error
 * without a Postgres code.
 */
export function isNetworkError(error: unknown, online: boolean): boolean {
  if (!online) return true;
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; message?: unknown; name?: unknown };
  if (typeof e.code === "string" && e.code !== "") return false;
  const text = `${String(e.name ?? "")} ${String(e.message ?? "")}`;
  return /fetch|network|load failed|timeout|abort/i.test(text);
}
