import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),

  getCurrentUserUnsettledDebtsByGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: input.groupId,
            payerId: {
              not: ctx.session.user.id,
            },
          },
          debtorId: ctx.session.user.id,
          settled: {
            lt: ctx.prisma.expenseDebt.fields.amount,
          },
        },
        include: {
          expense: true,
        },
        orderBy: {
          expense: {
            createdAt: "desc",
          },
        },
      });
    }),

  getUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
