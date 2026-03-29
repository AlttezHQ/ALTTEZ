/**
 * Service Worker — Elevate Sports
 * Strategy: Cache-first for assets, Network-first for API/HTML
 *
 * Versión: Bump CACHE_NAME to force update propagation.
 */

const CACHE_NAME = "elevate-v1";

// Assets to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Do NOT call self.skipWaiting() here — wait for explicit SKIP_WAITING message
  // so the UpdateToast component controls when the SW takes over.
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all clients immediately (first install only — updates wait)
  self.clients.claim();
});

// ── Message: SKIP_WAITING from UpdateToast ────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Fetch: Stale-while-revalidate for same-origin, passthrough for others ─────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests on same origin
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Network-first for HTML navigation (always get fresh shell)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html")
      )
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});
