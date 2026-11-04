import type { MetadataRoute } from "next";

/** PWA manifest: installable on the home screen (SPEC §5). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hospitrend",
    short_name: "Hospitrend",
    description: "Votre veille hôtellerie, tourisme et bien-être en 10 minutes par jour.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F6FA",
    theme_color: "#14213D",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
