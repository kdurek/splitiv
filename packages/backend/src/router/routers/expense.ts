import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const expenseRouter = router({
  getExpensesByGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.expense.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          payer: true,
          debts: {
            orderBy: {
              debtorId: "desc",
            },
            include: {
              debtor: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  createExpense: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string(),
        payerId: z.string(),
        amount: z.string(),
        debts: z.array(
          z.object({
            amount: z.string(),
            debtorId: z.string(),
            settled: z.string().default("0.00"),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.create({
        data: {
          group: {
            connect: {
              id: input.groupId,
            },
          },
          name: input.name,
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

  updateExpense: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        groupId: z.string(),
        name: z.string(),
        payerId: z.string(),
        amount: z.string(),
        debts: z.array(
          z.object({
            amount: z.string(),
            debtorId: z.string(),
            settled: z.string().default("0.00"),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.update({
        where: {
          id: input.expenseId,
        },
        data: {
          name: input.name,
          amount: input.amount,
          debts: {
            deleteMany: {
              expenseId: input.expenseId,
            },
            createMany: {
              data: input.debts,
            },
          },
        },
      });
    }),

  updateExpenseDebt: protectedProcedure
    .input(
      z.object({
        expenseDebtId: z.string(),
        settled: z.string().default("0.00"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const expenseDebt = await ctx.prisma.expenseDebt.findUniqueOrThrow({
        where: {
          id: input.expenseDebtId,
        },
        select: {
          amount: true,
          debtorId: true,
          expense: {
            select: {
              payerId: true,
            },
          },
        },
      });

      if (input.settled > expenseDebt?.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kwota do oddania nie może być większa niż kwota do zapłaty",
        });
      }

      if (expenseDebt?.expense.payerId === expenseDebt?.debtorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nie można edytować kwoty do oddania osoby płacącej",
        });
      }

      return ctx.prisma.expenseDebt.update({
        where: {
          id: input.expenseDebtId,
        },
        data: {
          settled: input.settled,
        },
      });
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ expenseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.delete({
        where: {
          id: input.expenseId,
        },
      });
    }),
});
