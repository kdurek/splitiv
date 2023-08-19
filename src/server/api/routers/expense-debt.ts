import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const expenseDebtRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        payerId: z.string().cuid2().optional(),
        debtorId: z.string().cuid2().optional(),
        isSettled: z.boolean().optional(),
      }),
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: ctx.session.activeGroupId,
            payerId: input.payerId || undefined,
          },
          debtorId: input.debtorId || undefined,
          settled: {
            lt: input.isSettled === false ? ctx.prisma.expenseDebt.fields.amount : undefined,
            equals: input.isSettled === true ? ctx.prisma.expenseDebt.fields.amount : undefined,
          },
        },
        include: {
          expense: true,
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
        expenseDebtId: z.string(),
        settled: z.number().default(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const expenseDebt = await ctx.prisma.expenseDebt.findUniqueOrThrow({
        where: {
          id: input.expenseDebtId,
        },
        select: {
          amount: true,
          debtorId: true,
          expense: {
            select: {
              payerId: true,
            },
          },
        },
      });

      if (ctx.session.user.id !== expenseDebt.debtorId && ctx.session.user.id !== expenseDebt.expense.payerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tylko osoba płacąca i oddająca dług może go edytować',
        });
      }

      if (input.settled > Number(expenseDebt.amount)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kwota do oddania nie może być większa niż kwota do zapłaty',
        });
      }

      if (expenseDebt?.expense.payerId === expenseDebt.debtorId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nie można edytować kwoty do oddania osoby płacącej',
        });
      }

      return ctx.prisma.expenseDebt.update({
        where: {
          id: input.expenseDebtId,
        },
        data: {
          settled: input.settled,
        },
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
      return ctx.prisma.$transaction(async (tx) => {
        await Promise.all(
          input.expenseDebts.map((expenseDebt) =>
            tx.expenseDebt.update({
              where: {
                id: expenseDebt.id,
              },
              data: {
                settled: expenseDebt.settled,
              },
            }),
          ),
        );
      });
    }),
});
