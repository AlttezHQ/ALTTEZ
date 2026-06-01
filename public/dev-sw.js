// Dev service worker kept intentionally minimal to avoid sticky caches during local development.
self.addEventListener("install", () => {
  self.skipWaiting();
});
