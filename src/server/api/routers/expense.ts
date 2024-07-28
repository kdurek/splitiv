import { ExpenseCreateInputSchema, ExpenseUpdateInputSchema } from 'prisma/generated/zod';
import { z } from 'zod';

import { expenseDebtRouter } from '@/server/api/routers/expense/debt';
import { expenseLogRouter } from '@/server/api/routers/expense/log';
import { expenseNoteRouter } from '@/server/api/routers/expense/note';
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpensesBetweenUsers,
  getInfiniteExpenses,
  updateExpense,
} from '@/server/api/services/expense';
import { checkExpenseAccess } from '@/server/api/services/expense';
import { sendPush } from '@/server/api/services/push-subscription';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseRouter = createTRPCRouter({
  debt: expenseDebtRouter,
  log: expenseLogRouter,
  note: expenseNoteRouter,

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        type: z.union([z.literal('active'), z.literal('archive'), z.literal('search')]),
        searchText: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      let expensesWhere = {};

      if (input.type === 'active') {
        expensesWhere = {
          groupId: ctx.user.activeGroupId,
          OR: [
            {
              payerId: ctx.user.id,
              debts: {
                some: {
                  settled: {
                    not: {
                      equals: ctx.db.expenseDebt.fields.amount,
                    },
                  },
                },
              },
            },
            {
              debts: {
                some: {
                  debtorId: ctx.user.id,
                  settled: {
                    lt: ctx.db.expenseDebt.fields.amount,
                  },
                },
              },
            },
          ],
        };
      }

      if (input.type === 'archive') {
        expensesWhere = {
          groupId: ctx.user.activeGroupId,
          OR: [
            {
              payerId: ctx.user.id,
              debts: {
                every: {
                  settled: {
                    equals: ctx.db.expenseDebt.fields.amount,
                  },
                },
              },
            },
            {
              payerId: ctx.user.id,
              debts: {
                every: {
                  settled: {
                    equals: ctx.db.expenseDebt.fields.amount,
                  },
                },
              },
            },
            {
              payerId: {
                not: ctx.user.id,
              },
              debts: {
                some: {
                  debtorId: ctx.user.id,
                  settled: {
                    equals: ctx.db.expenseDebt.fields.amount,
                  },
                },
              },
            },
          ],
        };
      }

      if (input.type === 'search') {
        expensesWhere = {
          groupId: ctx.user.activeGroupId,
          OR: [
            {
              name: {
                contains: input.searchText,
                mode: 'insensitive',
              },
              OR: [
                { payerId: ctx.user.id },
                {
                  debts: {
                    some: {
                      debtorId: ctx.user.id,
                    },
                  },
                },
              ],
            },
            {
              description: {
                contains: input.searchText,
                mode: 'insensitive',
              },
              OR: [
                { payerId: ctx.user.id },
                {
                  debts: {
                    some: {
                      debtorId: ctx.user.id,
                    },
                  },
                },
              ],
            },
          ],
        };
      }

      const infiniteExpenses = await getInfiniteExpenses(expensesWhere, input.limit, input.cursor);

      return infiniteExpenses;
    }),

  getExpensesBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const debts = await getExpensesBetweenUsers(ctx.user.activeGroupId, input.userId, ctx.user.id);
      const credits = await getExpensesBetweenUsers(ctx.user.activeGroupId, ctx.user.id, input.userId);
      return {
        debts,
        credits,
      };
    }),

  byId: protectedProcedure.input(z.object({ expenseId: z.string().cuid() })).query(async ({ input }) => {
    const expense = await getExpenseById(input.expenseId);
    return expense;
  }),

  create: protectedProcedure.input(ExpenseCreateInputSchema).mutation(async ({ input, ctx }) => {
    const expense = await createExpense(input);

    const userIdsToPush = [...expense.debts.map((debtor) => debtor.debtorId), expense.payerId].filter(
      (userId) => userId !== ctx.user.id,
    );

    await sendPush(userIdsToPush, 'Nowy wydatek', expense.name, `/wydatki/${expense.id}`);

    return expense;
  }),

  update: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        expenseData: ExpenseUpdateInputSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkExpenseAccess(ctx.user.id, input.expenseId);
      const expense = await updateExpense(input.expenseId, input.expenseData);
      return expense;
    }),

  delete: protectedProcedure.input(z.object({ expenseId: z.string() })).mutation(async ({ input, ctx }) => {
    await checkExpenseAccess(ctx.user.id, input.expenseId);
    const expense = await deleteExpense(input.expenseId);
    return expense;
  }),
});
