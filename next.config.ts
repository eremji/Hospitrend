import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Article images come from many news sites: shown with a plain <img>, not optimised.
    unoptimized: true,
  },
};

export default nextConfig;
