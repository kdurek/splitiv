import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { ExpirationPlugin, NetworkOnly, Serwist } from 'serwist';

import { notificationEventSchema, pushEventSchema } from '@/lib/validations/push';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

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
  const notificationEvent = notificationEventSchema.parse(event.notification);

  if (!notificationEvent.data.url) {
    return;
  }

  event.waitUntil(self.clients.openWindow(notificationEvent.data.url));
});

serwist.addEventListeners();
