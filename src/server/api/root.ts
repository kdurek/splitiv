import { expenseRouter } from '@/server/api/routers/expense';
import { groupRouter } from '@/server/api/routers/group';
import { pushSubscriptionRouter } from '@/server/api/routers/push-subscription';
import { userRouter } from '@/server/api/routers/user';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  group: groupRouter,
  pushSubscription: pushSubscriptionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
