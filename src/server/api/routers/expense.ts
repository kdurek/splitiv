import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { expenseDebtRouter } from '@/server/api/routers/expense/debt';
import { expenseLogRouter } from '@/server/api/routers/expense/log';
import { createTRPCRouter, protectedProcedure, t } from '@/server/api/trpc';
import Decimal from 'decimal.js';

const checkGroupAccess = t.procedure.use(async ({ ctx, next }) => {
  const group = await ctx.db.group.count({
    where: {
      id: ctx.user?.activeGroupId,
      members: {
        some: {
          userId: ctx.user?.id,
        },
      },
    },
  });

  if (!group) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Nie masz uprawnień do wykonania tej operacji',
    });
  }

  return next();
});

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
              debts: {
                every: {
                  settled: {
                    equals: ctx.db.expenseDebt.fields.amount,
                  },
                },
              },
            },
            {
              debts: {
                some: {
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
            },
            {
              description: {
                contains: input.searchText,
                mode: 'insensitive',
              },
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

  byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
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

    return expense;
  }),

  create: protectedProcedure
    .unstable_concat(checkGroupAccess)
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        amount: z.number().positive(),
        payerId: z.string(),
        debts: z.array(
          z.object({
            settled: z.number(),
            amount: z.number().positive(),
            debtorId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const debtsAmount = input.debts.reduce((acc, debt) => acc.plus(debt.amount), new Decimal(0));
      if (debtsAmount.minus(input.amount).abs().greaterThan(0)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Suma długów nie zgadza się z kwotą wydatku',
        });
      }

      if (input.debts.some((debt) => debt.settled > debt.amount)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kwota spłaty nie może przekroczyć kwoty długu',
        });
      }

      if (input.debts.length !== new Set(input.debts.map((debt) => debt.debtorId)).size) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ten sam dłużnik nie może wystąpić więcej niż raz',
        });
      }

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

      // const userIdsToPush = [...expense.debts.map((debtor) => debtor.debtorId), expense.payerId].filter(
      //   (userId) => userId !== ctx.user.id,
      // );

      // await sendPush(userIdsToPush, 'Nowy wydatek', expense.name, `/wydatki/${expense.id}`);

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
      const settledDebts = await ctx.db.expenseDebt.count({
        where: {
          expenseId: input.id,
          settled: {
            not: {
              equals: 0,
            },
          },
        },
      });
      if (settledDebts) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nie można usunąć wydatku z rozliczonymi długami',
        });
      }

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
