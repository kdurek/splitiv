import { TRPCError } from "@trpc/server";
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

  getById: protectedProcedure.query(async ({ ctx }) => {
    const group = await ctx.prisma.group.findUniqueOrThrow({
      where: { id: ctx.session.activeGroupId },
      include: {
        members: {
          select: { user: true },
        },
      },
    });

    if (
      !group.members.find((member) => member.user.id === ctx.session.user.id)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

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
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.userGroup.create({
        data: {
          groupId: ctx.session.activeGroupId,
          userId: input.userId,
        },
      });
    }),

  deleteUserFromGroup: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.userGroup.delete({
        where: {
          userId_groupId: {
            groupId: ctx.session.activeGroupId,
            userId: input.userId,
          },
        },
      });
    }),
});
