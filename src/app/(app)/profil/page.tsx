import type { Metadata } from "next";
import { AppearancePicker } from "@/components/AppearancePicker";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon profil · Hospitrend" };

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const meta = data.user?.user_metadata ?? {};
  const name = (meta.full_name as string) ?? (meta.name as string) ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-6">
      <h1 className="px-1 text-[26px] font-extrabold">Mon profil</h1>

      <section className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
        {name && <span className="text-base font-extrabold">{name}</span>}
        <span className="text-[15px] font-semibold text-muted">{data.user?.email}</span>
      </section>

      <AppearancePicker />

      <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-base font-extrabold">Bientôt ici</h2>
        <p className="text-[15px] leading-normal text-muted">
          Vos thèmes préférés, le nombre de cartes et l&apos;heure de la sélection arrivent dans les prochaines versions.
        </p>
      </section>

      <form action="/auth/signout" method="post" className="rounded-xl border border-border bg-surface px-4 py-1">
        <button type="submit" className="flex min-h-button w-full items-center text-base font-bold text-danger">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
