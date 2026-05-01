self.addEventListener("install", () => {});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch handler — required by Chrome to qualify for PWA install.
// Deliberately omits event.respondWith() so all requests go to the network normally.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const { title, body, url, notificationId } = payload;

  const showNotif = self.registration.showNotification(title, {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-64x64.png",
    data: { url, notificationId },
    tag: notificationId,
  });

  // Tell open clients to refresh unread count
  const notifyClients = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "PUSH_RECEIVED" }));
    });

  event.waitUntil(Promise.all([showNotif, notifyClients]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { url, notificationId } = event.notification.data ?? {};
  const targetUrl = url ? (notificationId ? `${url}?n=${notificationId}` : url) : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus any existing app window and navigate it
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // No window open — open new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
