import { expensesRouter } from "./routers/expenses";
import { groupsRouter } from "./routers/groups";
import { usersRouter } from "./routers/users";
import { router } from "./trpc";

export const appRouter = router({
  expenses: expensesRouter,
  groups: groupsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
