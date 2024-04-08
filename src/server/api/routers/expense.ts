import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { expenseDebtRouter } from '@/server/api/routers/expense/debt';
import { expenseLogRouter } from '@/server/api/routers/expense/log';
import { expenseNoteRouter } from '@/server/api/routers/expense/note';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { sendPush } from '@/server/utils/push';

export const expenseRouter = createTRPCRouter({
  debt: expenseDebtRouter,
  log: expenseLogRouter,
  note: expenseNoteRouter,

  listActive: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const items = await ctx.db.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
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
          notes: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              createdBy: true,
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

  listArchive: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const items = await ctx.db.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
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
          notes: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              createdBy: true,
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

  between: protectedProcedure
    .input(
      z.object({
        payerId: z.string().optional(),
        debtorId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.expense.findMany({
        where: {
          groupId: ctx.user.activeGroupId,
          payerId: input.payerId ?? undefined,
          debts: {
            some: {
              debtorId: input.debtorId ?? undefined,
              settled: {
                not: {
                  equals: ctx.db.expenseDebt.fields.amount,
                },
              },
            },
          },
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
          notes: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              createdBy: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  byId: protectedProcedure.input(z.object({ id: z.string().cuid2() })).query(({ input, ctx }) => {
    return ctx.db.expense.findUnique({
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
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            createdBy: true,
          },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z
          .union([z.string().min(3, { message: 'Minimalna długość to 3 znaki' }), z.string().length(0)])
          .optional(),
        payerId: z.string(),
        amount: z.number(),
        debts: z.array(
          z.object({
            amount: z.number(),
            debtorId: z.string(),
            settled: z.number().default(0),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const expense = await ctx.db.expense.create({
        data: {
          group: {
            connect: {
              id: ctx.user.activeGroupId,
            },
          },
          name: input.name,
          description: input.description ?? null,
          amount: input.amount,
          payer: {
            connect: {
              id: input.payerId,
            },
          },
          debts: {
            createMany: { data: input.debts },
          },
        },
        include: {
          debts: true,
        },
      });

      const userIdsToPush = [...expense.debts.map((debtor) => debtor.debtorId), expense.payerId].filter(
        (userId) => userId !== ctx.user.id,
      );

      await sendPush(userIdsToPush, 'Nowy wydatek', expense.name);

      return expense;
    }),

  update: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        name: z.string(),
        description: z
          .union([z.string().min(3, { message: 'Minimalna długość to 3 znaki' }), z.string().length(0)])
          .optional(),
        // payerId: z.string(),
        // amount: z.number(),
        // debts: z.array(
        //   z.object({
        //     amount: z.number(),
        //     debtorId: z.string(),
        //     settled: z.number().default(0),
        //   }),
        // ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.$transaction(async (tx) => {
        // const isAlreadyPaid = await ctx.db.expenseDebt.count({
        //   where: {
        //     expenseId: input.expenseId,
        //     debtorId: {
        //       not: input.payerId,
        //     },
        //     settled: {
        //       gt: 0,
        //     },
        //   },
        // });

        // if (!!isAlreadyPaid) {
        //   return;
        // }

        const expense = await tx.expense.update({
          where: {
            id: input.expenseId,
          },
          data: {
            name: input.name,
            description: input.description ?? null,
            // amount: input.amount,
            // payer: {
            //   connect: {
            //     id: input.payerId,
            //   },
            // },
            // debts: {
            //   deleteMany: {
            //     expenseId: input.expenseId,
            //   },
            //   createMany: {
            //     data: input.debts,
            //   },
            // },
          },
          include: {
            payer: true,
            group: true,
          },
        });

        if (expense.group.adminId !== ctx.user.id && expense.payerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Tylko ${expense.payer.name} może edytować ten wydatek`,
          });
        }

        return expense;
      });
    }),

  delete: protectedProcedure.input(z.object({ expenseId: z.string() })).mutation(async ({ input, ctx }) => {
    return ctx.db.$transaction(async (tx) => {
      const expense = await tx.expense.delete({
        where: {
          id: input.expenseId,
        },
        include: {
          payer: true,
          group: true,
        },
      });

      if (expense.group.adminId !== ctx.user.id && expense.payerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Tylko ${expense.payer.name} może usunąć ten wydatek`,
        });
      }
    });
  }),
});
