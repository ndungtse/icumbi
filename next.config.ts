import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // One small folder that runs with `node server.js`; nothing is installed on the servers.
  output: "standalone",
  // The servers have 1 GB of memory and photos are served as they are, so no image resizing.
  images: { unoptimized: true },
  poweredByHeader: false,
  // Data is fetched fresh on every request; nothing in this app uses "use cache".
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
