"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArticleDetail } from "@/components/ArticleDetail";
import { Toast } from "@/components/Toast";
import { fetchArticle, fetchSavedIds, recordOpen, setSaved } from "@/lib/data";
import { shareArticle } from "@/lib/share";
import type { Article } from "@/lib/types";

/** Detailed reading opened from « Mes favoris ». */
export function SavedArticleView({ id }: { id: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [saved, setSavedState] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
    Promise.all([fetchArticle(id), fetchSavedIds()])
      .then(([a, ids]) => {
        setArticle(a);
        setSavedState(ids.has(id));
      })
      .catch(() => setArticle(null));
    return () => {
      void recordOpen(id, Date.now() - openedAt.current).catch(() => {});
    };
  }, [id]);

  if (article === undefined) return <p className="px-5 py-10 text-center text-muted">Chargement…</p>;
  if (article === null) return <p className="px-5 py-10 text-center text-body">Cet article n&apos;est plus disponible.</p>;

  return (
    <div className="fixed inset-0 z-40 mx-auto max-w-[480px]">
      <ArticleDetail
        article={article}
        saved={saved}
        backLabel="Retour à mes favoris"
        onBack={() => router.push("/favoris")}
        onShare={async () => {
          try {
            if ((await shareArticle(article)) === "copied") setToast("Copié");
          } catch {
            setToast("Partage impossible sur ce navigateur.");
          }
        }}
        onToggleSave={async () => {
          const next = !saved;
          setSavedState(next);
          try {
            await setSaved(article.id, next);
            setToast(next ? "Ajouté à vos favoris" : "Retiré de vos favoris");
          } catch {
            setSavedState(!next);
            setToast("Favori non enregistré : vérifiez la connexion.");
          }
        }}
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
