import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Instagram CDN thumbnails (hostnames vary per region/shard)
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
  webpack(config, { isServer }) {
    // MSW runtimes are environment-specific: keep the worker out of the server bundle and Node interceptors out of the client.
    config.resolve.alias[isServer ? "msw/browser" : "msw/node"] = false;
    return config;
  },
};

export default nextConfig;
