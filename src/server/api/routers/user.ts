import { Gender } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),

  getById: protectedProcedure.input(z.object({ userId: z.string().cuid2() })).query(async ({ input, ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: input.userId,
      },
    });
  }),

  getPaymentSettle: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const contextUserDebts = await ctx.db.expenseDebt.findMany({
        where: {
          debtorId: ctx.session.user.id,
          settled: {
            lt: ctx.db.expenseDebt.fields.amount,
          },
          expense: {
            payer: {
              is: {
                id: input.userId,
              },
              isNot: {
                id: ctx.session.user.id,
              },
            },
            groupId: ctx.session.activeGroupId,
          },
        },
        include: {
          debtor: true,
          expense: {
            include: {
              payer: true,
            },
          },
        },
      });

      const pageUserDebts = await ctx.db.expenseDebt.findMany({
        where: {
          debtorId: input.userId,
          settled: {
            lt: ctx.db.expenseDebt.fields.amount,
          },
          expense: {
            payer: {
              is: {
                id: ctx.session.user.id,
              },
              isNot: {
                id: input.userId,
              },
            },
            groupId: ctx.session.activeGroupId,
          },
        },
        include: {
          debtor: true,
          expense: {
            include: {
              payer: true,
            },
          },
        },
      });

      return [...contextUserDebts, ...pageUserDebts];
    }),

  getAllNotInCurrentGroup: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      where: {
        groups: {
          none: {
            groupId: ctx.session.activeGroupId,
          },
        },
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2(),
        name: z.string().optional(),
        gender: z.nativeEnum(Gender).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          name: input.name,
          gender: input.gender,
        },
      });
    }),
});
