import { z } from 'zod';

import {
  checkExpenseDebtAccess,
  getDebtsBetweenUsers,
  settleByAmount,
  settleFully,
} from '@/server/api/services/expense/debt';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseDebtRouter = createTRPCRouter({
  getBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const debts = await getDebtsBetweenUsers(ctx.user.activeGroupId, input.userId, ctx.user.id);
      const credits = await getDebtsBetweenUsers(ctx.user.activeGroupId, ctx.user.id, input.userId);
      return {
        debts,
        credits,
      };
    }),

  settleByAmount: protectedProcedure
    .input(
      z.object({
        debtId: z.string().cuid(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const debt = await settleByAmount(input.debtId, input.amount);
      return debt;
    }),

  settleDebts: protectedProcedure
    .input(
      z.object({
        expenseDebts: z.array(
          z.object({
            id: z.string().cuid(),
            settled: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return Promise.all(
        input.expenseDebts.map(async (expenseDebt) => {
          await checkExpenseDebtAccess(expenseDebt.id, ctx.user.id);
          await settleByAmount(expenseDebt.id, expenseDebt.settled);
        }),
      );
    }),

  settleDebtsFully: protectedProcedure
    .input(
      z.object({
        expenseDebtIds: z.array(z.string().cuid()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return Promise.all(
        input.expenseDebtIds.map(async (expenseDebtId) => {
          await checkExpenseDebtAccess(expenseDebtId, ctx.user.id);
          await settleFully(expenseDebtId);
        }),
      );
    }),
});
