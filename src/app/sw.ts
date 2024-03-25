import type { SerwistGlobalConfig } from '@serwist/core';
import { ExpirationPlugin } from '@serwist/expiration';
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from '@serwist/precaching';
import { NetworkOnly } from '@serwist/strategies';
import { installSerwist } from '@serwist/sw';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/inject-manifest/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Anything random.
const revision = crypto.randomUUID();

installSerwist({
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
