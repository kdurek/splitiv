import { toUnit } from "dinero.js";
import { z } from "zod";

import { generateBalances } from "../../utils/generateBalances";
import { generateDebts } from "../../utils/generateDebts";
import { protectedProcedure, router } from "../trpc";

export const groupsRouter = router({
  createGroup: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.group.create({
        data: {
          name: input.name,
          adminId: ctx.user.id,
          members: {
            create: [
              {
                userId: ctx.user.id,
              },
            ],
          },
        },
      });
    }),

  getGroupsByMe: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findMany({
      where: { members: { some: { userId: ctx.user.id } } },
    });
  }),

  getGroupById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      const group = await ctx.prisma.group.findUnique({
        where: { id: input.groupId },
        include: {
          members: {
            select: { user: true },
          },
        },
      });

      if (!group) return null;

      const expenseUsers = await ctx.prisma.expenseUsers.findMany({
        where: {
          expense: {
            groupId: input.groupId,
          },
        },
      });

      const membersWithBalances = group.members.map((member) => {
        const generatedBalances = generateBalances(expenseUsers);

        const findBalance = (userId: string) => {
          const foundBalance = generatedBalances.find(
            (balance) => balance.userId === userId
          );
          if (!foundBalance) return "0.00";
          return toUnit(foundBalance.amount).toFixed(2);
        };

        const balance = findBalance(member.user.id);

        return { ...member.user, balance };
      });

      const debts = generateDebts(expenseUsers);

      return { ...group, members: membersWithBalances, debts };
    }),

  deleteGroupById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.group.delete({
        where: { id: input.groupId },
      });
    }),

  addUserToGroup: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.userGroups.create({
        data: {
          groupId: input.groupId,
          userId: input.userId,
        },
      });
    }),

  deleteUserFromGroup: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.userGroups.delete({
        where: {
          userId_groupId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      });
    }),

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
