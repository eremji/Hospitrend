import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, strokeWidth = 2.2, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconX = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconHeart = (p: IconProps) => (
  <Svg fill="currentColor" strokeWidth={2} {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Svg>
);

export const IconUndo = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </Svg>
);

export const IconBookmark = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M7 4h10v16l-5-3.5L7 20z" />
  </Svg>
);

export const IconBack = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12l5 5 9-10" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);

/** One simple pictogram per theme, used when an article has no image. */
const THEME_PATHS: Record<string, React.ReactNode> = {
  hospitality: (
    <>
      <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M10 21v-4h4v4" />
    </>
  ),
  tourism: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  mice: (
    <>
      <path d="M3 4h18M5 4v10h14V4M12 14v3M8 21l4-4 4 4" />
    </>
  ),
  wellness: (
    <>
      <path d="M12 21c-4-3-7-6.5-7-10.5A7 7 0 0 1 12 4a7 7 0 0 1 7 6.5c0 4-3 7.5-7 10.5z" />
      <path d="M12 8v9" />
    </>
  ),
  distribution: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  "hotel-tech": (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M10 10h4v4h-4zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  "guest-experience": <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  "food-beverage": <path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 21V3c-2 0-3 3-3 7h3" />,
  sustainability: (
    <>
      <path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" />
      <path d="M5 19l7-7" />
    </>
  ),
  hr: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2" />
    </>
  ),
  regulation: <path d="M12 3v18M5 21h14M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />,
  transport: <path d="M10.5 21l1.5-6-6 2-2-2 6-4-1-7 2-1 4 7 5-2a1.5 1.5 0 0 1 1 3l-5 2-1 7z" />,
  design: (
    <>
      <path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z" />
      <path d="M14 7l3 3" />
    </>
  ),
};

export function ThemeIcon({ slug, ...p }: IconProps & { slug: string }) {
  return <Svg {...p}>{THEME_PATHS[slug] ?? THEME_PATHS.tourism}</Svg>;
}
