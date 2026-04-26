self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch handler — required by Chrome to qualify for PWA install.
// Deliberately omits event.respondWith() so all requests go to the network normally.
self.addEventListener("fetch", () => {});
