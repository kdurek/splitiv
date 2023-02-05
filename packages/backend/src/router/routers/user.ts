import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  getCurrentUserUnsettledDebtsByGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: input.groupId,
            payerId: {
              not: ctx.user.id,
            },
          },
          debtorId: ctx.user.id,
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

  getUser: publicProcedure
    .input(z.object({ sub: z.string().optional() }))
    .query(({ input, ctx }) => {
      if (!input.sub) return null;

      return ctx.prisma.user.findUnique({
        where: { sub: input.sub },
      });
    }),

  getUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
