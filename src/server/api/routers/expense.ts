import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const expenseRouter = createTRPCRouter({
  getExpensesByGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        take: z.number().optional(),
        debtorId: z.string().optional(),
        settled: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.expense.findMany({
        where: {
          groupId: input.groupId,
          debts: {
            some: {
              debtorId: input.debtorId,
              settled: {
                lt: input.settled
                  ? undefined
                  : ctx.prisma.expenseDebt.fields.amount,
              },
            },
          },
        },
        take: input.take,
        include: {
          payer: true,
          debts: {
            orderBy: {
              debtorId: "desc",
            },
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
        orderBy: { createdAt: "desc" },
      });
    }),

  createExpense: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string(),
        description: z
          .union([
            z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
            z.string().length(0),
          ])
          .optional(),
        payerId: z.string(),
        amount: z.number(),
        debts: z.array(
          z.object({
            amount: z.number(),
            debtorId: z.string(),
            settled: z.number().default(0),
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

  updateExpense: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        groupId: z.string(),
        name: z.string(),
        payerId: z.string(),
        amount: z.number(),
        debts: z.array(
          z.object({
            amount: z.number(),
            debtorId: z.string(),
            settled: z.number().default(0),
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
        settled: z.number().default(0),
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

      if (
        ctx.session.user.id !== expenseDebt.debtorId &&
        ctx.session.user.id !== expenseDebt.expense.payerId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tylko osoba płacąca i oddająca dług może go edytować",
        });
      }

      if (input.settled > Number(expenseDebt.amount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kwota do oddania nie może być większa niż kwota do zapłaty",
        });
      }

      if (expenseDebt?.expense.payerId === expenseDebt.debtorId) {
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

  settleExpenseDebts: protectedProcedure
    .input(
      z.object({
        expenseDebts: z.array(
          z.object({
            id: z.string().cuid2(),
            settled: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return input.expenseDebts.forEach(async (debt) => {
        await ctx.prisma.expenseDebt.update({
          where: {
            id: debt.id,
          },
          data: {
            settled: debt.settled,
          },
        });
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
