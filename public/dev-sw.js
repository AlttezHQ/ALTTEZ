// Empty service worker to overwrite the old Vite PWA cache without looping
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
