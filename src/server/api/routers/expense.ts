import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { expenseDebtRouter } from '@/server/api/routers/expense/debt';
import { expenseLogRouter } from '@/server/api/routers/expense/log';
import { createTRPCRouter, protectedProcedure, t } from '@/server/api/trpc';
import { sendPush } from '@/server/utils/push-subscription';

const checkExpenseAccess = t.procedure
  .input(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .use(async ({ input, ctx, next }) => {
    const expense = await ctx.db.expense.findUnique({
      where: {
        id: input.id,
      },
      include: {
        group: true,
      },
    });

    if (!expense) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono wydatku',
      });
    }

    if (expense.group.adminId !== ctx.user?.id && expense.payerId !== ctx.user?.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Nie masz uprawnień do wykonania tej operacji',
      });
    }

    return next();
  });

export const expenseRouter = createTRPCRouter({
  debt: expenseDebtRouter,
  log: expenseLogRouter,

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

      const items = await ctx.db.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: expensesWhere,
        include: {
          group: true,
          payer: true,
          debts: {
            orderBy: {
              debtor: {
                name: 'asc',
              },
            },
            include: {
              debtor: true,
              logs: {
                include: {
                  debt: {
                    select: {
                      debtor: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let nextCursor: typeof input.cursor | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getExpensesBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.expense.findMany({
        where: {
          groupId: ctx.user.activeGroupId,
          OR: [
            {
              payerId: ctx.user.id,
              debts: {
                some: {
                  debtorId: input.userId,
                  settled: {
                    not: {
                      equals: ctx.db.expenseDebt.fields.amount,
                    },
                  },
                },
              },
            },
            {
              payerId: input.userId,
              debts: {
                some: {
                  debtorId: ctx.user.id,
                  settled: {
                    not: {
                      equals: ctx.db.expenseDebt.fields.amount,
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          group: true,
          payer: true,
          debts: {
            orderBy: {
              debtor: {
                name: 'asc',
              },
            },
            include: {
              debtor: true,
              logs: {
                include: {
                  debt: {
                    select: {
                      debtor: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return expenses;
    }),

  byId: protectedProcedure.input(z.object({ id: z.string().cuid() })).query(async ({ input, ctx }) => {
    const expense = await ctx.db.expense.findUnique({
      where: {
        id: input.id,
      },
      include: {
        group: true,
        payer: true,
        debts: {
          orderBy: {
            debtor: {
              name: 'asc',
            },
          },
          include: {
            debtor: true,
            logs: {
              include: {
                debt: {
                  include: {
                    debtor: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono wydatku',
      });
    }

    return expense;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        amount: z.number(),
        payerId: z.string(),
        debts: z.array(
          z.object({
            settled: z.number(),
            amount: z.number(),
            debtorId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const expense = await ctx.db.expense.create({
        data: {
          name: input.name,
          description: input.description,
          amount: input.amount,
          payerId: input.payerId,
          debts: {
            createMany: {
              data: input.debts,
            },
          },
          groupId: ctx.user.activeGroupId,
        },
        include: {
          debts: true,
        },
      });

      const userIdsToPush = [...expense.debts.map((debtor) => debtor.debtorId), expense.payerId].filter(
        (userId) => userId !== ctx.user.id,
      );

      await sendPush(userIdsToPush, 'Nowy wydatek', expense.name, `/wydatki/${expense.id}`);

      return expense;
    }),

  update: protectedProcedure
    .unstable_concat(checkExpenseAccess)
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const expense = await ctx.db.expense.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
        include: {
          payer: true,
          group: true,
        },
      });

      return expense;
    }),

  delete: protectedProcedure
    .unstable_concat(checkExpenseAccess)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const expense = await ctx.db.expense.delete({
        where: {
          id: input.id,
        },
        include: {
          payer: true,
          group: true,
        },
      });
      return expense;
    }),
});
