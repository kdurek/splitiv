import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.user.findFirst({
        where: {
          id: input.id,
        },
      });
    }),

  getCredits: protectedProcedure
    .input(z.object({ userId: z.string().cuid2() }))
    .query(({ input, ctx }) => {
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

  getDebts: protectedProcedure
    .input(z.object({ userId: z.string().cuid2() }))
    .query(({ input, ctx }) => {
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

  getAllNotInGroup: protectedProcedure.query(({ ctx }) => {
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

  changeActiveGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          activeGroupId: input.groupId,
        },
      });
    }),
});
