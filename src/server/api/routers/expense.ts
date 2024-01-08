import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
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
            },
          },
        },
        include: {
          debts: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  listInfinite: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        name: z.string().optional(),
        description: z.string().optional(),
        payerId: z.string().optional(),
        debtorId: z.string().optional(),
        isSettled: z.boolean().optional(),
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
              name: {
                contains: input.name || '',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: input.description || '',
                mode: 'insensitive',
              },
            },
          ],
          payerId: input.payerId || undefined,
          debts: {
            some: {
              debtorId: input.debtorId || undefined,
              settled: {
                lt: input.isSettled === false ? ctx.db.expenseDebt.fields.amount : undefined,
                equals: input.isSettled === true ? ctx.db.expenseDebt.fields.amount : undefined,
              },
            },
          },
        },
        include: {
          payer: true,
          debts: {
            include: {
              expense: {
                select: {
                  payerId: true,
                },
              },
              debtor: true,
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

      return ctx.db.expense.update({
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
      });
    }),

  delete: protectedProcedure.input(z.object({ expenseId: z.string() })).mutation(async ({ input, ctx }) => {
    return ctx.db.expense.delete({
      where: {
        id: input.expenseId,
      },
    });
  }),
});
