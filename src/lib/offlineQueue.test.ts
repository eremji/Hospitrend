import { describe, expect, it } from "vitest";
import {
  enqueue,
  flushQueue,
  isNetworkError,
  readQueue,
  removeQueued,
  type KeyValueStore,
  type QueuedOp,
  type SendResult,
} from "./offlineQueue";

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

const like = (articleId: string): QueuedOp => ({
  kind: "decision",
  articleId,
  type: "like",
  afterOpen: false,
  createdAt: "2026-11-04T08:00:00Z",
});

describe("offline queue", () => {
  it("keeps operations in order and survives a reload", () => {
    const store = memoryStore();
    enqueue(store, like("a"), "1");
    enqueue(store, like("b"), "2");
    expect(readQueue(store).map((i) => i.localId)).toEqual(["1", "2"]);
  });

  it("removes a queued choice when it is undone before being sent", () => {
    const store = memoryStore();
    enqueue(store, like("a"), "1");
    expect(removeQueued(store, "1")).toBe(true);
    expect(removeQueued(store, "1")).toBe(false);
    expect(readQueue(store)).toEqual([]);
  });

  it("sends everything when the network is back and returns the server ids", async () => {
    const store = memoryStore();
    enqueue(store, like("a"), "1");
    enqueue(store, { kind: "open", articleId: "a", durationMs: 4000, createdAt: "2026-11-04T08:00:00Z" }, "2");
    const sent: QueuedOp[] = [];
    const ids = await flushQueue(store, async (op) => {
      sent.push(op);
      return op.kind === "decision" ? { ok: true, interactionId: 42 } : { ok: true };
    });
    expect(sent).toHaveLength(2);
    expect(ids.get("1")).toBe(42);
    expect(readQueue(store)).toEqual([]);
  });

  it("stops at the first network failure and keeps the rest", async () => {
    const store = memoryStore();
    enqueue(store, like("a"), "1");
    enqueue(store, like("b"), "2");
    let calls = 0;
    await flushQueue(store, async (): Promise<SendResult> => (++calls === 1 ? { ok: true } : { ok: false, retry: true }));
    expect(readQueue(store).map((i) => i.localId)).toEqual(["2"]);
  });

  it("drops an operation the server refuses for good", async () => {
    const store = memoryStore();
    enqueue(store, like("purged"), "1");
    enqueue(store, like("b"), "2");
    const sent: string[] = [];
    await flushQueue(store, async (op) => {
      if (op.kind === "decision") sent.push(op.articleId);
      return op.kind === "decision" && op.articleId === "purged" ? { ok: false, retry: false } : { ok: true };
    });
    expect(sent).toEqual(["purged", "b"]);
    expect(readQueue(store)).toEqual([]);
  });

  it("works without storage (private browsing)", async () => {
    enqueue(null, like("a"), "1");
    expect(readQueue(null)).toEqual([]);
    expect(await flushQueue(null, async () => ({ ok: true }))).toEqual(new Map());
  });
});

describe("isNetworkError", () => {
  it("treats a failed fetch or an offline phone as a network error", () => {
    expect(isNetworkError({ message: "TypeError: Failed to fetch", code: "" }, true)).toBe(true);
    expect(isNetworkError({ message: "Load failed" }, true)).toBe(true);
    expect(isNetworkError({ message: "anything", code: "42501" }, false)).toBe(true);
  });

  it("does not retry a refusal from the database", () => {
    expect(isNetworkError({ message: "new row violates row-level security policy", code: "42501" }, true)).toBe(false);
    expect(isNetworkError({ message: "insert or update violates foreign key", code: "23503" }, true)).toBe(false);
  });
});
