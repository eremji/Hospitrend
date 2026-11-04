"use client";

import { useEffect } from "react";

/** Short status message ("Copié", errors). Announced to screen readers. */
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4">
      {message && (
        <div className="rounded-pill bg-primary px-5 py-3 text-[15px] font-bold text-on-primary shadow-card">{message}</div>
      )}
    </div>
  );
}
