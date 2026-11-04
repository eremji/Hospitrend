"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleDetail } from "@/components/ArticleDetail";
import { IconBookmark, IconCheck, IconHeart, IconUndo, IconX } from "@/components/icons";
import { Toast } from "@/components/Toast";
import { CardBody, SwipeCard, type SwipeCardHandle } from "@/components/feed/SwipeCard";
import {
  fetchFeed,
  fetchSavedIds,
  fetchTodayStats,
  flushOfflineQueue,
  recordDecision,
  type DecisionRef,
  recordOpen,
  setSaved,
  undoDecision,
} from "@/lib/data";
import { shareArticle } from "@/lib/share";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Article, Decision } from "@/lib/types";

/** Default daily size (SPEC US-08 CA1). Becomes a setting in V1. */
const DAILY_SIZE = 25;
const MORE_STEP = 5;

interface LastChoice {
  article: Article;
  /** Null while the choice is being sent. */
  ref: DecisionRef | null;
  type: Decision;
}

const OFFLINE_MESSAGE = "Hors connexion : vos choix seront envoyés dès le retour du réseau.";

type Status = "loading" | "ready" | "error";

async function loadInitial() {
  // Choices made offline are sent first, so the counter and the feed take them into account.
  await flushOfflineQueue();
  const [stats, ids] = await Promise.all([fetchTodayStats(), fetchSavedIds()]);
  const queue = await fetchFeed(DAILY_SIZE - stats.processed);
  return { stats, ids, queue };
}

export function Feed() {
  const [status, setStatus] = useState<Status>("loading");
  const [queue, setQueue] = useState<Article[]>([]);
  const [dailySize, setDailySize] = useState(DAILY_SIZE);
  const [processed, setProcessed] = useState(0);
  const [liked, setLiked] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<LastChoice | null>(null);
  const [detail, setDetail] = useState<Article | null>(null);
  const [extra, setExtra] = useState<Article[] | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<SwipeCardHandle>(null);
  const openedAt = useRef<number>(0);
  const openedFor = useRef<string | null>(null);
  const offlineNoticeShown = useRef(false);

  const notifyQueued = useCallback(() => {
    if (offlineNoticeShown.current) return;
    offlineNoticeShown.current = true;
    setToast(OFFLINE_MESSAGE);
  }, []);

  const load = useCallback(() => {
    loadInitial()
      .then(({ stats, ids, queue: q }) => {
        setProcessed(stats.processed);
        setLiked(stats.liked);
        setSavedCount(stats.saved);
        setSavedIds(ids);
        setQueue(q);
        setStatus("ready");
      })
      .catch((e) => {
        console.error(e);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
    void supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        const meta = data.user?.user_metadata ?? {};
        const name = (meta.given_name as string) || ((meta.full_name as string) ?? (meta.name as string) ?? "").split(" ")[0];
        setFirstName(name || null);
      });
  }, [load]);

  const top = queue[0];
  const finished = status === "ready" && !top;

  // At the end of the feed, check whether "5 more cards" is possible (SPEC US-08 CA4).
  useEffect(() => {
    if (!finished || extra !== null) return;
    fetchFeed(MORE_STEP)
      .then(setExtra)
      .catch(() => setExtra([]));
  }, [finished, extra]);

  const closeDetail = useCallback(() => {
    if (openedFor.current) {
      const id = openedFor.current;
      const duration = Date.now() - openedAt.current;
      openedFor.current = null;
      void recordOpen(id, duration).catch(console.error);
    }
    setDetail(null);
  }, []);

  const decide = useCallback(
    (type: Decision) => {
      const article = queue[0];
      if (!article) return;
      const afterOpen = openedFor.current === article.id;
      if (detail) closeDetail();
      // Optimistic: the next card shows at once (SPEC US-05 CA4).
      setQueue((q) => q.slice(1));
      setProcessed((n) => n + 1);
      if (type === "like") setLiked((n) => n + 1);
      const choice: LastChoice = { article, ref: null, type };
      setLast(choice);
      recordDecision(article.id, type, afterOpen)
        .then(({ ref, queued }) => {
          setLast((l) => (l === choice ? { ...choice, ref } : l));
          if (queued) notifyQueued();
        })
        .catch((e) => {
          console.error(e);
          setToast("Choix non enregistré : réessayez plus tard.");
        });
    },
    [queue, detail, closeDetail, notifyQueued],
  );

  const undo = useCallback(async () => {
    if (!last || last.ref === null) return;
    const choice = last;
    setLast(null); // only the last choice can be undone (SPEC US-07 CA4)
    try {
      await undoDecision(choice.ref!);
      setQueue((q) => [choice.article, ...q]);
      setProcessed((n) => Math.max(0, n - 1));
      if (choice.type === "like") setLiked((n) => Math.max(0, n - 1));
    } catch (e) {
      console.error(e);
      setToast("Impossible d'annuler pour l'instant.");
    }
  }, [last]);

  const toggleSave = useCallback(
    async (a: Article) => {
      const willSave = !savedIds.has(a.id);
      setSavedIds((s) => {
        const n = new Set(s);
        if (willSave) n.add(a.id);
        else n.delete(a.id);
        return n;
      });
      setSavedCount((n) => n + (willSave ? 1 : -1));
      try {
        const queued = await setSaved(a.id, willSave);
        if (queued) setToast(OFFLINE_MESSAGE);
        else setToast(willSave ? "Ajouté à vos favoris" : "Retiré de vos favoris");
      } catch (e) {
        console.error(e);
        setToast("Favori non enregistré : réessayez plus tard.");
      }
    },
    [savedIds],
  );

  const share = useCallback(async (a: Article) => {
    try {
      const r = await shareArticle(a);
      if (r === "copied") setToast("Copié");
    } catch {
      setToast("Partage impossible sur ce navigateur.");
    }
  }, []);

  const open = useCallback((a: Article) => {
    openedFor.current = a.id;
    openedAt.current = Date.now();
    setDetail(a);
  }, []);

  // Keyboard on desktop: ← / → like the buttons, Entrée opens (SPEC US-05 CA3).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (detail) {
        if (e.key === "Escape") closeDetail();
        return;
      }
      if (!top) return;
      if (e.key === "ArrowRight") cardRef.current?.swipe("like");
      else if (e.key === "ArrowLeft") cardRef.current?.swipe("dislike");
      else if (e.key === "Enter" && e.target === document.body) open(top);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, top, open, closeDetail]);

  if (detail) {
    return (
      <div className="fixed inset-0 z-40 mx-auto max-w-[480px]">
        <ArticleDetail
          article={detail}
          saved={savedIds.has(detail.id)}
          onBack={closeDetail}
          onToggleSave={() => toggleSave(detail)}
          onShare={() => share(detail)}
          onDecide={detail.id === top?.id ? decide : undefined}
          backLabel="Retour à la sélection"
        />
        <Toast message={toast} onDone={() => setToast(null)} />
      </div>
    );
  }

  const position = Math.min(processed + 1, dailySize);
  const progress = Math.min(1, processed / dailySize);
  const hour = new Date().getHours();
  const greeting = `${hour >= 18 ? "Bonsoir" : "Bonjour"}${firstName ? ` ${firstName}` : ""}`;

  return (
    <>
      <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-[max(20px,env(safe-area-inset-top))]">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-muted">{greeting}</span>
          <h1 className="text-[22px] font-extrabold">Votre sélection du jour</h1>
        </div>
        {!finished && status === "ready" && (
          <div
            role="img"
            aria-label={`Carte ${position} sur ${dailySize}`}
            className="flex size-14 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--ht-color-accent) 0 ${progress * 100}%, var(--ht-color-border) ${progress * 100}% 100%)`,
            }}
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-bg text-[13px] font-extrabold">
              {position}/{dailySize}
            </div>
          </div>
        )}
      </header>

      {status === "loading" && <p className="px-5 py-10 text-center text-muted">Chargement de votre sélection…</p>}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
          <p className="text-body">La sélection n&apos;a pas pu être chargée.</p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              load();
            }}
            className="min-h-button rounded-lg bg-primary px-6 font-bold text-on-primary">
            Réessayer
          </button>
        </div>
      )}

      {status === "ready" && top && (
        <>
          <div className="relative mx-4 min-h-0 flex-1">
            {queue[1] && (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex translate-y-2.5 scale-[0.96] flex-col overflow-hidden rounded-card border border-border bg-surface opacity-80"
              >
                <CardBody article={queue[1]} />
              </div>
            )}
            <SwipeCard key={top.id} ref={cardRef} article={top} onDecide={decide} onOpen={() => open(top)} />
          </div>

          <div className="flex shrink-0 items-center justify-center gap-[18px] px-4 pb-2 pt-4">
            <button
              type="button"
              onClick={undo}
              disabled={!last || last.ref === null}
              aria-label="Annuler le dernier choix"
              className="flex size-action-side items-center justify-center rounded-full border border-border bg-surface text-muted shadow-card disabled:opacity-40"
            >
              <IconUndo />
            </button>
            <button
              type="button"
              onClick={() => cardRef.current?.swipe("dislike")}
              className="flex flex-col items-center gap-1.5 text-[13px] font-bold text-text"
            >
              <span className="flex size-action-main items-center justify-center rounded-full border-2 border-primary bg-surface">
                <IconX size={30} />
              </span>
              Pas pour moi
            </button>
            <button
              type="button"
              onClick={() => cardRef.current?.swipe("like")}
              className="flex flex-col items-center gap-1.5 text-[13px] font-extrabold text-accent-text"
            >
              <span className="flex size-action-main items-center justify-center rounded-full bg-accent text-on-accent shadow-card">
                <IconHeart size={30} />
              </span>
              J&apos;aime
            </button>
            <button
              type="button"
              onClick={() => toggleSave(top)}
              aria-label={savedIds.has(top.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={savedIds.has(top.id)}
              className="flex size-action-side items-center justify-center rounded-full border border-border bg-surface text-muted shadow-card"
            >
              <IconBookmark filled={savedIds.has(top.id)} />
            </button>
          </div>
        </>
      )}

      {finished && (
        <EndOfFeed
          empty={processed === 0}
          seen={processed}
          liked={liked}
          saved={savedCount}
          canUndo={!!last && last.ref !== null}
          onUndo={undo}
          more={extra && extra.length > 0 ? () => {
            setDailySize((s) => s + MORE_STEP);
            setQueue(extra);
            setExtra(null);
          } : null}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}

/** « Vous êtes à jour » (SPEC US-08 CA4), design « Concierge — Fin du flux ». */
function EndOfFeed({
  empty,
  seen,
  liked,
  saved,
  canUndo,
  onUndo,
  more,
}: {
  empty: boolean;
  seen: number;
  liked: number;
  saved: number;
  canUndo: boolean;
  onUndo: () => void;
  more: (() => void) | null;
}) {
  if (empty && !more) {
    return (
      <div className="flex flex-1 flex-col gap-3 px-5 pt-10">
        <h2 className="text-2xl font-extrabold">Pas encore d&apos;actualités</h2>
        <p className="text-[17px] leading-normal text-muted">
          La collecte des sources n&apos;a pas encore eu lieu. Elle tourne chaque matin avant 6 h : revenez un peu plus tard.
        </p>
      </div>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto px-5 pb-4 pt-6">
      <div className="flex flex-col gap-5">
        <div className="flex size-[88px] items-center justify-center rounded-full bg-idea-bg text-accent-text">
          <IconCheck size={44} />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-[32px] font-extrabold leading-[1.15]">Vous êtes à jour !</h2>
          <p className="text-[17px] leading-normal text-muted">Une nouvelle sélection vous attend demain matin.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-4 shadow-card">
          <Stat value={seen} label="vues" />
          <Stat value={liked} label="aimées" accent />
          <Stat value={saved} label="en favoris" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5 pt-6">
        {more && (
          <button type="button" onClick={more} className="min-h-button-lg rounded-lg bg-accent text-base font-extrabold text-on-accent">
            5 cartes de plus
          </button>
        )}
        <Link
          href="/favoris"
          className="flex min-h-button-lg items-center justify-center rounded-lg bg-primary text-base font-extrabold text-on-primary"
        >
          Revoir mes favoris
        </Link>
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex min-h-button items-center justify-center gap-2 rounded-lg border-2 border-primary text-base font-bold text-text"
          >
            <IconUndo /> Annuler le dernier choix
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-[28px] font-extrabold ${accent ? "text-accent-text" : ""}`}>{value}</span>
      <span className="text-[13px] font-semibold text-muted">{label}</span>
    </div>
  );
}
