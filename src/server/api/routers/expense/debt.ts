import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseDebtRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        payerId: z.string().cuid2().optional(),
        debtorId: z.string().cuid2().optional(),
        isSettled: z.boolean().optional(),
      }),
    )
    .query(({ input, ctx }) => {
      return ctx.db.expenseDebt.findMany({
        where: {
          expense: {
            groupId: ctx.session.activeGroupId,
            payerId: input.payerId || undefined,
          },
          debtorId: input.debtorId || undefined,
          settled: {
            lt: input.isSettled === false ? ctx.db.expenseDebt.fields.amount : undefined,
            equals: input.isSettled === true ? ctx.db.expenseDebt.fields.amount : undefined,
          },
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

            if (ctx.session.user.id !== previousDebt.debtorId && ctx.session.user.id !== previousDebt.expense.payerId) {
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