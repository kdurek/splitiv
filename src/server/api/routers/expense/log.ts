import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, t } from '@/server/api/trpc';

const checkExpenseLogAccess = t.procedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .use(async ({ input, ctx, next }) => {
    const expenseLog = await ctx.db.expenseLog.findUnique({
      where: {
        id: input.id,
      },
      include: {
        debt: {
          include: {
            expense: {
              include: {
                group: true,
              },
            },
          },
        },
      },
    });

    if (!expenseLog) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono logu wydatku',
      });
    }

    if (expenseLog.debt.expense.group.adminId !== ctx.user?.id && expenseLog.debt.expense.payerId !== ctx.user?.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Nie masz uprawnień do wykonania tej operacji',
      });
    }

    return next();
  });

export const expenseLogRouter = createTRPCRouter({
  revert: protectedProcedure
    .unstable_concat(checkExpenseLogAccess)
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const expenseLog = await ctx.db.$transaction(async (tx) => {
        const expenseLog = await tx.expenseLog.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!expenseLog) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Nie znaleziono logu wydatku',
          });
        }

        const expenseDebt = await tx.expenseDebt.findUnique({
          where: {
            id: expenseLog.debtId,
          },
          include: {
            expense: {
              include: {
                payer: true,
                group: true,
              },
            },
          },
        });

        if (!expenseDebt) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Nie znaleziono długu',
          });
        }

        await tx.expenseDebt.update({
          where: {
            id: expenseLog.debtId,
          },
          data: {
            settled: Decimal.sub(expenseDebt.settled, expenseLog.amount),
          },
        });

        await tx.expenseLog.delete({
          where: {
            id: input.id,
          },
        });

        return expenseLog;
      });
      return expenseLog;
    }),
});
