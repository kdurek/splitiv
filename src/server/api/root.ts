import { expenseRouter } from "./routers/expense";
import { groupRouter } from "./routers/group";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  group: groupRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
