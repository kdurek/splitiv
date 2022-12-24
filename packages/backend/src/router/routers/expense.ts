import { z } from "zod";

import { generateDebts } from "../../utils/generateDebts";
import { protectedProcedure, router } from "../trpc";

export const expenseRouter = router({
  getExpensesByGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      const expenses = await ctx.prisma.expense.findMany({
        where: {
          groupId: input.groupId,
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return expenses.map((expense) => {
        const repayments = generateDebts(expense.users);
        return {
          ...expense,
          repayments,
        };
      });
    }),

  createExpense: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string(),
        amount: z.string(),
        users: z.array(
          z.object({
            paid: z.string(),
            owed: z.string(),
            userId: z.string(),
          })
        ),
        type: z.string().optional(),
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
          users: {
            create: input.users,
          },
          type: input.type ?? "expense",
        },
        include: {
          users: true,
        },
      });
    }),

  updateExpense: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.update({
        where: {
          id: input.expenseId,
        },
        data: {
          name: input.name,
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
