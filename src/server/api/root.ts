import { expenseRouter } from "./routers/expense";
import { groupRouter } from "./routers/group";
import { recipeRouter } from "./routers/recipe";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  group: groupRouter,
  recipe: recipeRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
