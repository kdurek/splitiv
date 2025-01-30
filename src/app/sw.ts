import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { ExpirationPlugin, NetworkOnly, Serwist } from 'serwist';
import { z } from 'zod';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const pushEventSchema = z.object({
  title: z.string(),
  body: z.string(),
  url: z.string().optional(),
});

const notificationEventSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: z.object({
    url: z.string().optional(),
  }),
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /\/api\/auth\/.*/,
      handler: new NetworkOnly({
        plugins: [
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
        networkTimeoutSeconds: 10, // fallback to cache if API does not response within 10 seconds
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

self.addEventListener('push', (event) => {
  const pushEvent = pushEventSchema.parse(event.data?.json());

  event.waitUntil(
    self.registration.showNotification(pushEvent.title, {
      body: pushEvent.body,
      data: {
        url: pushEvent.url,
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const notificationEvent = notificationEventSchema.parse(event.notification);

      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url === notificationEvent.data.url ? (windowClient.focus(), true) : false,
      );

      if (!hadWindowToFocus) {
        void self.clients
          .openWindow(notificationEvent.data.url ? notificationEvent.data.url : self.location.origin)
          .then((windowClient) => (windowClient ? windowClient.focus() : null));
      }
    }),
  );
});

serwist.addEventListeners();
