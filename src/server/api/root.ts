import { expenseRouter } from './routers/expense';
import { expenseDebtRouter } from './routers/expense-debt';
import { expenseNoteRouter } from './routers/expense-note';
import { groupRouter } from './routers/group';
import { userRouter } from './routers/user';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  expenseDebt: expenseDebtRouter,
  expenseNote: expenseNoteRouter,
  expense: expenseRouter,
  group: groupRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
