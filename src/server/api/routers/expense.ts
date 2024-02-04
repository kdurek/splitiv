import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        type: z.enum(['dashboard', 'archived']),
      }),
    )
    .query(async ({ input, ctx }) => {
      const items = await ctx.db.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          groupId: ctx.session.activeGroupId,
          OR: [
            {
              payerId: ctx.session.user.id,
            },
            {
              debts: {
                some: {
                  debtorId: ctx.session.user.id,
                },
              },
            },
          ],
          debts: {
            some: {
              settled: {
                lt: input.type === 'dashboard' ? ctx.db.expenseDebt.fields.amount : undefined,
              },
            },
            every: {
              settled: {
                equals: input.type === 'archived' ? ctx.db.expenseDebt.fields.amount : undefined,
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
          groupId: ctx.session.activeGroupId,
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

  byId: protectedProcedure.input(z.object({ id: z.string().cuid2().optional() })).query(({ input, ctx }) => {
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
      return ctx.db.expense.create({
        data: {
          group: {
            connect: {
              id: ctx.session.activeGroupId,
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

        if (expense.group.adminId !== ctx.session.user.id && expense.payerId !== ctx.session.user.id) {
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

      if (expense.group.adminId !== ctx.session.user.id && expense.payerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Tylko ${expense.payer.name} może usunąć ten wydatek`,
        });
      }
    });
  }),
});
