import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Accès réservé · Hospitrend" };

/** Shown when the Google account is not on the allowed list (SPEC US-01 CA3). */
export default function RestrictedPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-5 px-6">
      <h1 className="text-[32px] font-extrabold">Accès réservé</h1>
      <p className="text-[17px] leading-normal text-muted">
        Hospitrend est pour l&apos;instant réservé à quelques personnes. Ce compte Google n&apos;en fait pas partie, et
        aucune donnée n&apos;a été conservée.
      </p>
      <form action="/auth/signout" method="post">
        <button type="submit" className="min-h-button-lg w-full rounded-lg bg-primary text-base font-extrabold text-on-primary">
          Utiliser un autre compte
        </button>
      </form>
      <Link href="/login" className="sr-only">
        Retour à la connexion
      </Link>
    </main>
  );
}
