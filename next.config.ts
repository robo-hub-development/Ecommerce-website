import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

// Product and category images are served by the backend, so its host is allowed for next/image.
// An unset or malformed API_BASE_URL (e.g. a literal '' from a dashboard) must not break config loading; src/lib/env.ts reports it.
function backendImagePatterns(): RemotePattern[] {
  try {
    // Same cleanup as src/lib/env.ts: dashboards can store wrapping quotes or stray whitespace.
    const raw = (process.env.API_BASE_URL ?? "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();
    const url = new URL(raw);
    return [
      { protocol: url.protocol === "http:" ? "http" : "https", hostname: url.hostname, port: url.port },
    ];
  } catch {
    console.warn("[next.config] API_BASE_URL is missing or not a valid URL: backend images will be blocked by next/image.");
    return [];
  }
}

const nextConfig: NextConfig = {
  // MSW reads a .wasm file from its own folder at runtime; bundled, that file is missing from the serverless function.
  serverExternalPackages: ["msw", "@mswjs/interceptors"],
  images: {
    remotePatterns: [
      ...backendImagePatterns(),
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Instagram CDN thumbnails (hostnames vary per region/shard)
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
  webpack(config, { isServer }) {
    // MSW only runs in Node (the browser never calls the backend): keep its interceptors out of the client bundle.
    if (!isServer) config.resolve.alias["msw/node"] = false;
    return config;
  },
};

export default nextConfig;
