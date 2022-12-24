import { expenseRouter } from "./routers/expense";
import { groupRouter } from "./routers/group";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  expense: expenseRouter,
  group: groupRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
