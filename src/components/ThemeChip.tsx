import { themeLabel } from "@/lib/taxonomy";

/** Theme pill coloured by its topic tint (design/tokens.css). */
export function ThemeChip({ slug, onImage = false }: { slug: string; onImage?: boolean }) {
  return (
    <span
      data-topic={slug}
      className={`inline-flex items-center rounded-pill px-3 py-[5px] text-[13px] font-bold ${
        onImage ? "bg-surface text-topic-fg" : "bg-topic text-topic-fg"
      }`}
    >
      {themeLabel(slug)}
    </span>
  );
}
