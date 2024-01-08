import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { generateBalances } from '@/server/utils/generateBalances';
import { generateDebts } from '@/server/utils/generateDebts';

export const groupRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) => {
    return ctx.db.group.findMany({
      where: { members: { some: { userId: ctx.session.user.id } } },
    });
  }),

  current: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.activeGroupId) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'activeGroupId is not set',
      });
    }

    const group = await ctx.db.group.findUniqueOrThrow({
      where: { id: ctx.session.activeGroupId },
      include: {
        members: {
          orderBy: {
            user: {
              name: 'asc',
            },
          },
          select: { user: true },
        },
      },
    });

    if (!group.members.find((member) => member.user.id === ctx.session.user.id)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }

    const expenseDebts = await ctx.db.expenseDebt.findMany({
      where: {
        expense: {
          groupId: ctx.session.activeGroupId,
        },
        settled: { lt: ctx.db.expenseDebt.fields.amount },
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
        const foundBalance = generatedBalances.find((balance) => balance.userId === userId);
        if (!foundBalance) return '0.00';
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

  create: protectedProcedure.input(z.object({ name: z.string() })).mutation(({ input, ctx }) => {
    return ctx.db.group.create({
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

  changeCurrent: protectedProcedure.input(z.object({ groupId: z.string().cuid2() })).mutation(({ input, ctx }) => {
    return ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        activeGroupId: input.groupId,
      },
    });
  }),

  addUser: protectedProcedure.input(z.object({ userId: z.string() })).mutation(async ({ input, ctx }) => {
    return ctx.db.userGroup.create({
      data: {
        groupId: ctx.session.activeGroupId,
        userId: input.userId,
      },
    });
  }),
});
