import type { SerwistGlobalConfig } from '@serwist/core';
import { ExpirationPlugin } from '@serwist/expiration';
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from '@serwist/precaching';
import { NetworkOnly } from '@serwist/strategies';
import { Serwist } from '@serwist/sw';

import { notificationEventSchema, pushEventSchema } from '@/lib/validations/push';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/inject-manifest/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
  interface Window {
    serwist: Serwist;
  }
}

declare const self: ServiceWorkerGlobalScope;

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

const serwist = new Serwist();
// Anything random.
const revision = crypto.randomUUID();

serwist.install({
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
        revision,
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});
