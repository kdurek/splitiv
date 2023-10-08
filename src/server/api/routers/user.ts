import { Gender } from '@prisma/client';
import { z } from 'zod';

import { generateBalances } from '@/server/utils/generateBalances';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getById: protectedProcedure.input(z.object({ userId: z.string().cuid2() })).query(async ({ input, ctx }) => {
    const expenseDebts = await ctx.prisma.expenseDebt.findMany({
      where: {
        expense: {
          groupId: ctx.session.activeGroupId,
        },
        settled: { lt: ctx.prisma.expenseDebt.fields.amount },
      },
      include: {
        expense: {
          select: {
            amount: true,
            payerId: true,
          },
        },
      },
    });

    const generatedBalances = generateBalances(expenseDebts);
    const userBalance = generatedBalances.find((balance) => balance.userId === input.userId);
    console.log('🚀 > file: user.ts:33 > getById:protectedProcedure.input > userBalance:', userBalance);

    return ctx.prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });
  }),

  getCredits: protectedProcedure.input(z.object({ userId: z.string().cuid2() })).query(({ input, ctx }) => {
    return ctx.prisma.expenseDebt.findMany({
      where: {
        settled: {
          lt: ctx.prisma.expenseDebt.fields.amount,
        },
        expense: {
          payer: {
            id: input.userId,
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
  }),

  getDebts: protectedProcedure.input(z.object({ userId: z.string().cuid2() })).query(({ input, ctx }) => {
    return ctx.prisma.expenseDebt.findMany({
      where: {
        debtorId: input.userId,
        settled: {
          lt: ctx.prisma.expenseDebt.fields.amount,
        },
        expense: {
          payer: {
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
  }),

  getPaymentSettle: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const contextUserDebts = await ctx.prisma.expenseDebt.findMany({
        where: {
          debtorId: ctx.session.user.id,
          settled: {
            lt: ctx.prisma.expenseDebt.fields.amount,
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

      const pageUserDebts = await ctx.prisma.expenseDebt.findMany({
        where: {
          debtorId: input.userId,
          settled: {
            lt: ctx.prisma.expenseDebt.fields.amount,
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
    return ctx.prisma.user.findMany({
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
      return ctx.prisma.user.update({
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
