import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseDebtRouter = createTRPCRouter({
  settlement: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2(),
      }),
    )
    .query(({ input, ctx }) => {
      return ctx.db.expenseDebt.findMany({
        where: {
          expense: {
            groupId: ctx.user.activeGroupId,
          },
          OR: [
            {
              expense: {
                payerId: input.userId,
              },
              debtorId: ctx.user.id,
              settled: {
                lt: ctx.db.expenseDebt.fields.amount,
              },
            },
            {
              expense: {
                payerId: ctx.user.id,
              },
              debtorId: input.userId,
              settled: {
                lt: ctx.db.expenseDebt.fields.amount,
              },
            },
          ],
        },
        include: {
          expense: {
            include: {
              payer: true,
            },
          },
          debtor: true,
        },
        orderBy: {
          expense: {
            createdAt: 'desc',
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        settled: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const debt = await tx.expenseDebt.findUniqueOrThrow({
          where: {
            id: input.id,
          },
        });

        await tx.expenseLog.create({
          data: {
            debtId: debt.id,
            amount: Decimal.sub(input.settled, debt.settled),
          },
        });

        return tx.expenseDebt.update({
          where: {
            id: input.id,
          },
          data: {
            settled: input.settled,
          },
        });
      });
    }),

  settle: protectedProcedure
    .input(
      z.object({
        expenseDebts: z.array(
          z.object({
            id: z.string().cuid2(),
            settled: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.$transaction(async (tx) => {
        await Promise.all(
          input.expenseDebts.map(async (expenseDebt) => {
            const previousDebt = await tx.expenseDebt.findUniqueOrThrow({
              where: {
                id: expenseDebt.id,
              },
              include: {
                expense: true,
              },
            });

            if (ctx.user.id !== previousDebt.debtorId && ctx.user.id !== previousDebt.expense.payerId) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Tylko osoba płacąca i oddająca dług może go edytować',
              });
            }

            if (expenseDebt.settled > Number(previousDebt.amount)) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Kwota do oddania nie może być większa niż kwota do zapłaty',
              });
            }

            if (previousDebt.expense.payerId === previousDebt.debtorId) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Nie można edytować kwoty do oddania osoby płacącej',
              });
            }

            const debt = await tx.expenseDebt.update({
              where: {
                id: expenseDebt.id,
              },
              data: {
                settled: expenseDebt.settled,
              },
            });

            await tx.expenseLog.create({
              data: {
                debtId: previousDebt.id,
                amount: Decimal.sub(debt.settled, previousDebt.settled),
              },
            });
          }),
        );
      });
    }),
});
