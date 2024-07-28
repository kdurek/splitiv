import { z } from 'zod';

import { checkExpenseLogAccess, revertExpenseLog } from '@/server/api/services/expense/log';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseLogRouter = createTRPCRouter({
  revert: protectedProcedure
    .input(
      z.object({
        logId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await checkExpenseLogAccess(ctx.user.id, input.logId);
      const expenseLog = await revertExpenseLog(input.logId);
      return expenseLog;
    }),
});
