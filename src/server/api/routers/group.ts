import { z } from "zod";

import { generateBalances } from "../../utils/generateBalances";
import { generateDebts } from "../../utils/generateDebts";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const groupRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.group.create({
        data: {
          name: input.name,
          adminId: ctx.session.user.id,
          members: {
            create: [
              {
                userId: ctx.session.user.id,
              },
            ],
          },
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ groupId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const group = await ctx.prisma.group.findUniqueOrThrow({
        where: { id: input.groupId },
        include: {
          members: {
            select: { user: true },
          },
        },
      });

      const expenseDebts = await ctx.prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: input.groupId,
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

      const membersWithBalances = group.members.map((member) => {
        const findBalance = (userId: string) => {
          const foundBalance = generatedBalances.find(
            (balance) => balance.userId === userId
          );
          if (!foundBalance) return "0.00";
          return foundBalance.amount;
        };

        const balance = findBalance(member.user.id);

        return { ...member.user, balance };
      });

      const debts = generateDebts(expenseDebts);

      return {
        ...group,
        members: membersWithBalances,
        debts,
      };
    }),

  deleteById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.group.delete({
        where: { id: input.groupId },
      });
    }),

  addUserToGroup: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.userGroup.create({
        data: {
          groupId: input.groupId,
          userId: input.userId,
        },
      });
    }),

  deleteUserFromGroup: protectedProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.userGroup.delete({
        where: {
          userId_groupId: {
            groupId: input.groupId,
            userId: input.userId,
          },
        },
      });
    }),
});
