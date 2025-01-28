import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

// const checkExpenseDebtAccess = t.procedure
//   .input(
//     z.object({
//       id: z.string().cuid(),
//     }),
//   )
//   .use(async ({ input, ctx, next }) => {
//     const expenseDebt = await ctx.db.expenseDebt.findUnique({
//       where: {
//         id: input.id,
//       },
//       include: {
//         expense: true,
//       },
//     });

//     if (!expenseDebt) {
//       throw new TRPCError({
//         code: 'NOT_FOUND',
//         message: 'Nie znaleziono długu',
//       });
//     }

//     if (ctx.user?.id !== expenseDebt.debtorId && ctx.user?.id !== expenseDebt.expense.payerId) {
//       throw new TRPCError({
//         code: 'BAD_REQUEST',
//         message: 'Tylko osoba płacąca i oddająca dług może go edytować',
//       });
//     }

//     if (expenseDebt.expense.payerId === expenseDebt.debtorId) {
//       throw new TRPCError({
//         code: 'BAD_REQUEST',
//         message: 'Nie można edytować kwoty do oddania osoby płacącej',
//       });
//     }

//     return next();
//   });

export const expenseDebtRouter = createTRPCRouter({
  getBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const debts = await ctx.db.expenseDebt.findMany({
        where: {
          expense: {
            groupId: ctx.user.activeGroupId,
            payerId: input.userId,
          },
          debtorId: ctx.user.id,
          settled: {
            lt: ctx.db.expenseDebt.fields.amount,
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

      const credits = await ctx.db.expenseDebt.findMany({
        where: {
          expense: {
            groupId: ctx.user.activeGroupId,
            payerId: ctx.user.id,
          },
          debtorId: input.userId,
          settled: {
            lt: ctx.db.expenseDebt.fields.amount,
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
    .mutation(async ({ input, ctx }) => {
      const debt = await ctx.db.$transaction(async (tx) => {
        const debt = await tx.expenseDebt.findUnique({
          where: {
            id: input.debtId,
          },
        });

        if (!debt) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Nie znaleziono długu',
          });
        }

        if (Decimal.add(input.amount, debt.settled).greaterThan(debt.amount)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Kwota do oddania nie może być większa niż kwota do zapłaty',
          });
        }

        await tx.expenseLog.create({
          data: {
            debtId: input.debtId,
            amount: input.amount,
          },
        });

        return tx.expenseDebt.update({
          where: {
            id: input.debtId,
          },
          data: {
            settled: Decimal.add(input.amount, debt.settled),
          },
        });
      });

      return debt;
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
          await ctx.db.$transaction(async (tx) => {
            const debt = await tx.expenseDebt.findUnique({
              where: {
                id: expenseDebtId,
              },
            });

            if (!debt) {
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Nie znaleziono długu',
              });
            }

            await tx.expenseLog.create({
              data: {
                debtId: expenseDebtId,
                amount: Decimal.sub(debt.amount, debt.settled),
              },
            });

            return tx.expenseDebt.update({
              where: {
                id: expenseDebtId,
              },
              data: {
                settled: debt.amount,
              },
            });
          });
        }),
      );
    }),
});
