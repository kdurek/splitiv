import type { RouterClient } from "@orpc/server";
import { authRouter } from "./auth";
import { expenseRouter } from "./expense";
import { groupRouter } from "./group";
import { pushSubscriptionRouter } from "./push-subscription";

export const appRouter = {
  expense: expenseRouter,
  group: groupRouter,
  pushSubscription: pushSubscriptionRouter,
  auth: authRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
