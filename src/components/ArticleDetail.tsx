"use client";

import { ArticleVisual } from "@/components/ArticleVisual";
import { IconBack, IconBookmark, IconExternal, IconHeart, IconShare, IconX } from "@/components/icons";
import { ThemeChip } from "@/components/ThemeChip";
import { fullDate, languageLabel } from "@/lib/format";
import type { Article, Decision } from "@/lib/types";

interface Props {
  article: Article;
  saved: boolean;
  onBack: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  /** Present in the feed only: like / dislike from the detailed view (SPEC US-06 CA3). */
  onDecide?: (d: Decision) => void;
  backLabel?: string;
}

/** Detailed reading (SPEC US-06), design « Concierge — Lecture détaillée ». */
export function ArticleDetail({ article: a, saved, onBack, onToggleSave, onShare, onDecide, backLabel = "Retour" }: Props) {
  const themes = [a.main_theme, ...a.secondary_themes];
  const hasSummary = a.summary_status === "done" && a.summary_points && a.summary_points.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <ArticleVisual imageUrl={a.image_url} theme={a.main_theme} className="h-[140px] shrink-0">
        <div className="absolute inset-x-3.5 top-3.5 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="flex size-11 items-center justify-center rounded-full bg-surface text-text shadow-card"
          >
            <IconBack size={22} />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onShare}
              aria-label="Partager"
              className="flex size-11 items-center justify-center rounded-full bg-surface text-text shadow-card"
            >
              <IconShare />
            </button>
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={saved}
              className="flex size-11 items-center justify-center rounded-full bg-surface text-text shadow-card"
            >
              <IconBookmark filled={saved} />
            </button>
          </div>
        </div>
      </ArticleVisual>

      <main className="relative -mt-6 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-t-card bg-surface px-5 pb-6 pt-5">
        <div className="flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <ThemeChip key={t} slug={t} />
          ))}
        </div>
        <h1 className="text-[23px] font-extrabold leading-tight" lang={a.language}>
          {a.title}
        </h1>
        <p className="text-[13px] font-semibold text-muted">
          {a.source_name} · {languageLabel(a.language)} · {fullDate(a.published_at)}
        </p>

        {hasSummary ? (
          <ul className="flex list-disc flex-col gap-2 pl-5 text-[17px] leading-relaxed text-body">
            {a.summary_points!.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : a.excerpt ? (
          <>
            <p className="text-[17px] leading-relaxed text-body" lang={a.language}>
              {a.excerpt}
            </p>
            <p className="text-[13px] font-semibold text-muted">Extrait fourni par la source.</p>
          </>
        ) : (
          <p className="text-[15px] leading-normal text-muted">
            La source ne fournit pas d&apos;extrait pour cet article. Ouvrez-le pour le lire.
          </p>
        )}

        {hasSummary && a.hotel_impact && (
          <section className="flex flex-col gap-1.5 rounded-lg bg-idea-bg px-4 py-3.5 text-idea-fg">
            <h2 className="text-[15px] font-extrabold">Ce que ça change pour un hôtel</h2>
            <p className="text-base leading-normal">{a.hotel_impact}</p>
          </section>
        )}

        {a.tags.length > 0 && <p className="text-[13px] font-semibold text-muted">{a.tags.join(" · ")}</p>}

        <a
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex min-h-button items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-bold text-on-primary"
        >
          Lire l&apos;article complet sur le site <IconExternal size={18} />
        </a>
      </main>

      {onDecide && (
        <div className="flex shrink-0 justify-center gap-6 border-t border-border bg-surface px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => onDecide("dislike")}
            className="flex min-h-button items-center gap-2 rounded-pill border-2 border-primary bg-surface px-[22px] text-base font-bold text-text"
          >
            <IconX /> Pas pour moi
          </button>
          <button
            type="button"
            onClick={() => onDecide("like")}
            className="flex min-h-button items-center gap-2 rounded-pill bg-accent px-[26px] text-base font-extrabold text-on-accent"
          >
            <IconHeart /> J&apos;aime
          </button>
        </div>
      )}
    </div>
  );
}
