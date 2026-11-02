
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  // Replace "YOUR_REPO_NAME" with your GitHub repository name
  basePath: "/Ecommerce-website",

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },

  webpack(config, { isServer }) {
    config.resolve.alias[isServer ? "msw/browser" : "msw/node"] = false;
    return config;
  },
};

export default nextConfig;
