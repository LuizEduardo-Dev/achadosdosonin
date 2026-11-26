import type { NextConfig } from "next";
import { getServerEnv, isPreviewDeployment } from "./src/lib/env";

// Fail fast on build/dev startup if required environment variables are missing or invalid.
const env = getServerEnv();
const previewMode = isPreviewDeployment();
const isDev = process.env.NODE_ENV === "development";

const supabaseUrl = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseHostname = supabaseUrl.hostname;
const supabaseOrigin = supabaseUrl.origin;

function buildContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseOrigin}`,
    `connect-src 'self' ${supabaseOrigin}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

const ADMIN_NOINDEX_HEADERS = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  },
  {
    key: "Cache-Control",
    value: "private, no-cache, no-store, must-revalidate",
  },
];

const PUBLIC_EDGE_CACHE_HEADERS = [
  {
    key: "Cache-Control",
    value: "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
  },
  {
    key: "Netlify-CDN-Cache-Control",
    value: "public, s-maxage=30, stale-while-revalidate=60",
  },
];

const PUBLIC_EDGE_CACHE_SOURCES = ["/", "/tt", "/ig", "/wpp", "/c/:slug", "/grupo"];

const nextConfig: NextConfig = {
  env: {
    // Forward Netlify's built-in CONTEXT into a public env var so `?debugInApp=`
    // works automatically in deploy-preview / branch-deploy and stays disabled in production.
    NEXT_PUBLIC_NETLIFY_CONTEXT: env.CONTEXT || env.NEXT_PUBLIC_NETLIFY_CONTEXT,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/achados-images/**",
      },
    ],
  },
  async headers() {
    const globalSecurityHeaders = [
      {
        key: "Content-Security-Policy",
        value: buildContentSecurityPolicy(),
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      ...(!isDev
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
      // Prevent search engines from indexing Netlify preview/branch deploys while keeping production indexable.
      ...(previewMode
        ? [
            {
              key: "X-Robots-Tag",
              value: "noindex, nofollow",
            },
          ]
        : []),
    ];

    return [
      {
        source: "/:path*",
        headers: globalSecurityHeaders,
      },
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
        source: "/admin",
        headers: ADMIN_NOINDEX_HEADERS,
      },
      {
        source: "/admin/:path*",
        headers: ADMIN_NOINDEX_HEADERS,
      },
      ...PUBLIC_EDGE_CACHE_SOURCES.map((source) => ({
        source,
        headers: PUBLIC_EDGE_CACHE_HEADERS,
      })),
    ];
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
