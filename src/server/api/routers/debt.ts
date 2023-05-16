import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const debtRouter = createTRPCRouter({
  getDebts: protectedProcedure
    .input(
      z.object({
        groupId: z.string().cuid2().optional(),
        payerId: z.string().cuid2().optional(),
        debtorId: z.string().cuid2().optional(),
        isSettled: z.boolean().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: input.groupId,
            payerId: input.payerId || undefined,
          },
          debtorId: input.debtorId || undefined,
          settled: {
            lt:
              input.isSettled === false
                ? ctx.prisma.expenseDebt.fields.amount
                : undefined,
            equals:
              input.isSettled === true
                ? ctx.prisma.expenseDebt.fields.amount
                : undefined,
          },
        },
        include: {
          expense: true,
          debtor: true,
        },
        orderBy: {
          expense: {
            createdAt: "desc",
          },
        },
      });
    }),
});
