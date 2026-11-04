"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Sélection" },
  { href: "/favoris", label: "Mes favoris" },
  { href: "/profil", label: "Mon profil" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="mx-4 mb-[max(14px,env(safe-area-inset-bottom))] mt-1 grid h-nav shrink-0 grid-cols-3 gap-1.5 rounded-xl bg-nav p-1.5"
    >
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-center rounded-md text-sm ${
              active ? "bg-nav-active font-extrabold text-nav-active-fg" : "font-semibold text-nav-fg"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
