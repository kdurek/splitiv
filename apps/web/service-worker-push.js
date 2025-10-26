self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", handlePush);
self.addEventListener("notificationclick", handleNotificationClick);

async function handlePush(event) {
  try {
    const data = event.data?.json();

    if (!data?.title) {
      console.error("Push event is missing title.", data);
      return;
    }

    const options = {
      body: data.body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      tag: data.tag,
      data: {
        url: data.url || self.location.origin,
      },
    };

    await event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error("Error processing push event:", error);
  }
}

async function handleNotificationClick(event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url || self.location.origin;

  const promise = async () => {
    const clientsArr = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    const windowClient = clientsArr.find((client) => client.url === urlToOpen);

    if (windowClient) {
      return windowClient.focus();
    }
    return self.clients.openWindow(urlToOpen);
  };

  await event.waitUntil(promise());
}
