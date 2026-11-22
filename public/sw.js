const STATIC_CACHE = "sonin-links-static-v1";
const PAGES_CACHE = "sonin-links-pages-v1";
const ALLOWED_CACHES = [STATIC_CACHE, PAGES_CACHE];

const OFFLINE_URL = "/offline";
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

const PUBLIC_STOREFRONT_PATHS = new Set(["/", "/tt", "/ig", "/wpp"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ALLOWED_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheableResponse(response) {
  if (!response || response.status !== 200 || response.type !== "basic") {
    return false;
  }

  const cacheControl = (response.headers.get("cache-control") || "").toLowerCase();
  if (cacheControl.includes("no-store") || cacheControl.includes("private")) {
    return false;
  }

  if (response.headers.has("set-cookie")) {
    return false;
  }

  return true;
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/images/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept non-GET requests (Server Actions, form POSTs, etc.)
  if (request.method !== "GET") {
    return;
  }

  // Never intercept requests carrying auth headers or Next Server Actions
  if (
    request.headers.has("authorization") ||
    request.headers.has("next-action")
  ) {
    return;
  }

  const url = new URL(request.url);

  // Only handle same-origin requests (never cache Supabase API / auth / external origins)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Strictly never cache or intercept admin routes, API routes, or SW script itself
  if (
    url.pathname === "/admin" ||
    url.pathname.startsWith("/admin/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/sw.js"
  ) {
    return;
  }

  // 1. Static assets: cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        const networkResponse = await fetch(request);
        if (isCacheableResponse(networkResponse)) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }),
    );
    return;
  }

  // 2. Public storefront pages: stale-while-revalidate with offline fallback
  if (
    request.mode === "navigate" &&
    PUBLIC_STOREFRONT_PATHS.has(url.pathname)
  ) {
    event.respondWith(
      caches.open(PAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        const networkFetch = fetch(request)
          .then((response) => {
            if (isCacheableResponse(response)) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkFetch);
          return cached;
        }

        const networkResponse = await networkFetch;
        if (networkResponse) {
          return networkResponse;
        }

        const offlineFallback = await caches.match(OFFLINE_URL);
        return (
          offlineFallback ||
          new Response("Você está sem conexão no momento.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }),
    );
    return;
  }

  // 3. Other public navigations: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const offlineFallback = await caches.match(OFFLINE_URL);
        return (
          offlineFallback ||
          new Response("Você está sem conexão no momento.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }),
    );
  }
});
