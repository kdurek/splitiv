import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseLogRouter = createTRPCRouter({
  revert: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const expenseLog = await tx.expenseLog.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });

        const expenseDebt = await tx.expenseDebt.findUniqueOrThrow({
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

        if (
          expenseDebt.expense.group.adminId !== ctx.session.user.id &&
          expenseDebt.expense.payerId !== ctx.session.user.id
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Tylko ${expenseDebt.expense.payer.name} może cofnąć spłatę tego długu`,
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

        return null;
      });
    }),
});
