"use client";

import { useEffect, useState } from "react";

type Choice = "light" | "dark" | "auto";
const OPTIONS: { value: Choice; label: string }[] = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "auto", label: "Auto" },
];

function applyTheme(c: Choice) {
  const root = document.documentElement;
  try {
    if (c === "auto") {
      delete root.dataset.theme;
      localStorage.removeItem("ht-theme");
    } else {
      root.dataset.theme = c;
      localStorage.setItem("ht-theme", c);
    }
  } catch {
    // private browsing: the choice lasts for this visit only
  }
}

/** « Apparence : Clair / Sombre / Auto ». Stored on this device only. */
export function AppearancePicker() {
  const [choice, setChoice] = useState<Choice>("auto");

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the DOM after hydration
    setChoice(t === "light" || t === "dark" ? t : "auto");
  }, []);

  const pick = (c: Choice) => {
    setChoice(c);
    applyTheme(c);
  };

  return (
    <div role="radiogroup" aria-labelledby="appearance-label" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <span id="appearance-label" className="text-base font-extrabold">
        Apparence
      </span>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const on = choice === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pick(o.value)}
              className={`min-h-touch rounded-md text-sm ${
                on ? "bg-primary font-extrabold text-on-primary" : "border border-border-strong bg-surface font-bold text-text"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
