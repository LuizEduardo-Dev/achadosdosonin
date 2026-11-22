import type { NextConfig } from "next";
import { getServerEnv, isPreviewDeployment } from "./src/lib/env";

// Fail fast on build/dev startup if required environment variables are missing or invalid.
const env = getServerEnv();
const previewMode = isPreviewDeployment();

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    // Forward Netlify's built-in CONTEXT into a public env var so `?debugInApp=`
    // works automatically in deploy-preview / branch-deploy and stays disabled in production.
    NEXT_PUBLIC_NETLIFY_CONTEXT: env.CONTEXT || env.NEXT_PUBLIC_NETLIFY_CONTEXT,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    const rules = [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];

    // Prevent search engines from indexing Netlify preview/branch deploys while keeping production indexable.
    if (previewMode) {
      rules.push({
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      });
    }

    return rules;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
