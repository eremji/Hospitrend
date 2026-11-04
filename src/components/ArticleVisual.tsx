"use client";

import { useState } from "react";
import { ThemeIcon } from "@/components/icons";

/** Article image, or the theme's default visual when there is none (SPEC US-04 CA1). */
export function ArticleVisual({
  imageUrl,
  theme,
  className = "",
  children,
}: {
  imageUrl: string | null;
  theme: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl && !failed;
  return (
    <div data-topic={theme} className={`relative overflow-hidden bg-topic text-topic-fg ${className}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- images come from many news sites
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-80">
          <ThemeIcon slug={theme} size={56} strokeWidth={1.6} />
        </div>
      )}
      {children}
    </div>
  );
}
