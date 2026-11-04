import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const metadata: Metadata = { title: "Connexion · Hospitrend" };

/** Welcome screen with a single « Continuer avec Google » button (SPEC US-01 CA1). */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { erreur } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-between px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-20">
      <div className="flex flex-col gap-5">
        <div aria-hidden="true" className="flex gap-2">
          <span data-topic="hospitality" className="size-10 rounded-sm bg-topic" />
          <span data-topic="tourism" className="size-10 rounded-sm bg-topic" />
          <span data-topic="wellness" className="size-10 rounded-sm bg-topic" />
        </div>
        <h1 className="text-[38px] font-extrabold">Hospitrend</h1>
        <p className="text-[22px] font-semibold leading-[1.35]">
          10 minutes par jour pour ne plus rien rater de ce qui compte dans votre métier.
        </p>
        <p className="text-base leading-normal text-muted">
          Chaque matin, une sélection d&apos;actualités choisies pour vous. Un geste pour dire si ça vous plaît.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {erreur && (
          <p role="alert" className="text-center text-[15px] font-semibold text-danger">
            La connexion n&apos;a pas abouti. Réessayez.
          </p>
        )}
        <GoogleSignInButton />
        <p className="text-center text-[13px] text-muted">Vos choix servent uniquement à personnaliser votre sélection.</p>
      </div>
    </main>
  );
}
