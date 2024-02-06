import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import { headers } from 'next/headers';

import { type AppRouter } from '@/server/api/root';
import { getUrl, transformer } from '@/trpc/shared';

export const api = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === 'development' || (op.direction === 'down' && op.result instanceof Error),
    }),
    httpBatchLink({
      transformer,
      url: getUrl(),
      headers() {
        const heads = new Map(headers());
        heads.set('x-trpc-source', 'rsc');
        return Object.fromEntries(heads);
      },
    }),
  ],
});
