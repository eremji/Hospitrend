"use client";

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { ArticleVisual } from "@/components/ArticleVisual";
import { ThemeChip } from "@/components/ThemeChip";
import { relativeDate, languageLabel } from "@/lib/format";
import { truncateSentences } from "@/lib/ingest/text";
import type { Article, Decision } from "@/lib/types";

/** Share of the screen width past which releasing validates the choice (SPEC US-05 CA2). */
const SWIPE_THRESHOLD = 0.3;
const FLING_VELOCITY = 800;

export interface SwipeCardHandle {
  swipe(d: Decision): void;
}

interface Props {
  article: Article;
  onDecide: (d: Decision) => void;
  onOpen: () => void;
}

/** The top card of the stack: follows the finger, tilts, shows the choice (SPEC US-05). */
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ article, onDecide, onOpen }, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [24, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -24], [1, 0]);
  // A drag that snaps back must not also count as a tap.
  const dragged = useRef(false);

  const flyOut = (d: Decision) => {
    const w = typeof window === "undefined" ? 400 : window.innerWidth;
    animate(x, d === "like" ? w * 1.3 : -w * 1.3, { duration: 0.22, ease: "easeIn" }).then(() => onDecide(d));
  };

  useImperativeHandle(ref, () => ({ swipe: flyOut }));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const w = window.innerWidth;
    const passed = Math.abs(info.offset.x) > w * SWIPE_THRESHOLD || Math.abs(info.velocity.x) > FLING_VELOCITY;
    if (passed && info.offset.x !== 0) flyOut(info.offset.x > 0 ? "like" : "dislike");
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
  };

  return (
    <motion.article
      // Keyboard and screen readers: the card is a button that opens the detailed reading (WCAG 2.1.1).
      role="button"
      tabIndex={0}
      aria-label={`Lire en détail : ${article.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="absolute inset-0 flex cursor-grab touch-pan-y select-none flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragElastic={0.9}
      dragMomentum={false}
      onPointerDown={() => (dragged.current = false)}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={onDragEnd}
      onTap={() => {
        if (!dragged.current) onOpen();
      }}
    >
      <CardBody article={article} />
      <motion.div
        aria-hidden="true"
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-4 top-4 rotate-[-10deg] rounded-md border-[3px] border-[#15803D] bg-[#F0FDF4] px-3 py-1 text-lg font-extrabold text-[#15803D]"
      >
        J&apos;aime
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-4 top-4 rotate-[10deg] rounded-md border-[3px] border-[#475569] bg-[#F8FAFC] px-3 py-1 text-lg font-extrabold text-[#334155]"
      >
        Pas pour moi
      </motion.div>
    </motion.article>
  );
});

/** Card content (SPEC US-04 CA1), shared by the top card and the one behind it. */
export function CardBody({ article: a }: { article: Article }) {
  const summary = truncateSentences(a.summary_short || a.excerpt, 3);
  return (
    <>
      <ArticleVisual imageUrl={a.image_url} theme={a.main_theme} className="h-[clamp(100px,20dvh,170px)] shrink-0">
        <div className="absolute inset-x-3.5 bottom-3.5 flex flex-wrap gap-1.5">
          <ThemeChip slug={a.main_theme} onImage />
          {a.language !== "fr" && (
            <span className="rounded-pill bg-surface px-2.5 py-[5px] text-[13px] font-extrabold text-text">
              {a.language.toUpperCase()}
            </span>
          )}
        </div>
      </ArticleVisual>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-[18px] py-4">
        <p className="shrink-0 text-[13px] font-semibold text-muted">
          {a.source_name} · {languageLabel(a.language)} · {relativeDate(a.published_at)}
        </p>
        <h2 className="line-clamp-3 shrink-0 text-[clamp(19px,5.6vw,23px)] font-extrabold leading-[1.22]" lang={a.language}>
          {a.title}
        </h2>
        {summary && (
          <p className="line-clamp-3 min-h-0 shrink overflow-hidden text-base leading-normal text-body [@media(min-height:780px)]:line-clamp-4" lang={a.summary_short ? "fr" : a.language}>
            {summary}
          </p>
        )}
        <p className="mt-auto shrink-0 text-[13px] font-semibold text-muted [@media(max-height:700px)]:hidden">Touchez la carte pour lire en détail</p>
      </div>
    </>
  );
}
