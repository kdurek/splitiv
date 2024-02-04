import { expenseRouter } from '@/server/api/routers/expense';
import { expenseDebtRouter } from '@/server/api/routers/expense-debt';
import { expenseLogRouter } from '@/server/api/routers/expense-log';
import { expenseNoteRouter } from '@/server/api/routers/expense-note';
import { groupRouter } from '@/server/api/routers/group';
import { userRouter } from '@/server/api/routers/user';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  expenseDebt: expenseDebtRouter,
  expenseLog: expenseLogRouter,
  expenseNote: expenseNoteRouter,
  expense: expenseRouter,
  group: groupRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
