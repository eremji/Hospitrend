"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArticleVisual } from "@/components/ArticleVisual";
import { IconSearch, IconShare } from "@/components/icons";
import { Toast } from "@/components/Toast";
import { fetchSaved, type SavedArticle } from "@/lib/data";
import { languageLabel, relativeDate } from "@/lib/format";
import { shareArticle } from "@/lib/share";
import { THEMES, themeLabel } from "@/lib/taxonomy";

/** « Mes favoris » (SPEC US-14 CA3), design « Concierge — Favoris ». */
export function SavedList() {
  const [items, setItems] = useState<SavedArticle[] | null>(null);
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchSaved()
      .then(setItems)
      .catch((e) => {
        console.error(e);
        setError(true);
      });
  }, []);

  const themes = useMemo(() => {
    const present = new Set((items ?? []).map((a) => a.main_theme));
    return THEMES.filter((t) => present.has(t.slug)).map((t) => t.slug);
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (a) => (!theme || a.main_theme === theme) && (!q || `${a.title} ${a.source_name}`.toLowerCase().includes(q)),
    );
  }, [items, theme, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 flex-col gap-3.5 px-4 pb-2.5 pt-[max(20px,env(safe-area-inset-top))]">
        <h1 className="px-1 text-[28px] font-extrabold">Mes favoris</h1>
        {items && items.length > 0 && (
          <>
            <label className="flex h-button items-center gap-2.5 rounded-lg border border-border-strong bg-surface px-4 text-muted">
              <IconSearch />
              <span className="sr-only">Rechercher dans mes favoris</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Retrouver un article…"
                className="min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-placeholder"
              />
            </label>
            <div role="group" aria-label="Filtrer par thème" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              <FilterButton on={theme === null} onClick={() => setTheme(null)}>
                Tous
              </FilterButton>
              {themes.map((t) => (
                <FilterButton key={t} topic={t} on={theme === t} onClick={() => setTheme(theme === t ? null : t)}>
                  {themeLabel(t)}
                </FilterButton>
              ))}
            </div>
          </>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-1">
        {error && <p className="py-8 text-center text-body">Vos favoris n&apos;ont pas pu être chargés.</p>}
        {!error && items === null && <p className="py-8 text-center text-muted">Chargement…</p>}
        {items?.length === 0 && (
          <p className="px-1 py-6 text-[17px] leading-normal text-muted">
            Aucun favori pour l&apos;instant. Touchez le signet d&apos;une carte pour la mettre de côté et la retrouver ici.
          </p>
        )}
        <ul className="flex flex-col gap-2.5">
          {visible.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-[18px] bg-surface p-2.5 shadow-card">
              <ArticleVisual imageUrl={a.image_url} theme={a.main_theme} className="size-16 shrink-0 rounded-sm [&_svg]:size-7" />
              <Link href={`/article/${a.id}`} className="flex min-w-0 flex-1 flex-col gap-1">
                <span data-topic={a.main_theme} className="text-xs font-extrabold text-topic-fg">
                  {themeLabel(a.main_theme)}
                </span>
                <span className="line-clamp-2 text-[15px] font-bold leading-snug" lang={a.language}>
                  {a.title}
                </span>
                <span className="text-xs font-semibold text-muted">
                  {a.source_name} · {languageLabel(a.language)} · {relativeDate(a.published_at)}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`Partager : ${a.title}`}
                onClick={async () => {
                  try {
                    if ((await shareArticle(a)) === "copied") setToast("Copié");
                  } catch {
                    setToast("Partage impossible sur ce navigateur.");
                  }
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted"
              >
                <IconShare />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function FilterButton({
  on,
  topic,
  onClick,
  children,
}: {
  on: boolean;
  topic?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      data-topic={topic}
      onClick={onClick}
      className={`min-h-10 shrink-0 whitespace-nowrap rounded-pill px-4 text-sm font-bold ${
        on ? "bg-primary text-on-primary" : topic ? "bg-topic text-topic-fg" : "border border-border-strong bg-surface text-text"
      }`}
    >
      {children}
    </button>
  );
}
