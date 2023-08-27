import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { env } from 'env.mjs';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            // eslint-disable-next-line no-console
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });
}

export { handler as GET, handler as POST };
