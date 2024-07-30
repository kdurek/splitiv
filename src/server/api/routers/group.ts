import { TRPCError } from '@trpc/server';
import { GroupCreateInputSchema } from 'prisma/generated/zod';
import { z } from 'zod';

import {
  addUserToGroup,
  checkGroupMembership,
  createGroup,
  getAllGroups,
  getGroupById,
} from '@/server/api/services/group';
import { changeCurrentGroup } from '@/server/api/services/user';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { generateBalances } from '@/server/utils/generateBalances';
import { generateDebts } from '@/server/utils/generateDebts';
import { generateDebtsForUser } from '@/server/utils/generateDebtsForUser';

export const groupRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const groups = await getAllGroups(ctx.user.id);
    return groups;
  }),

  current: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.activeGroupId) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Aktywna grupa nie została ustawiona',
      });
    }

    const group = await getGroupById(ctx.user.activeGroupId);

    await checkGroupMembership(ctx.user.activeGroupId, ctx.user.id);

    const expenseDebts = await ctx.db.expenseDebt.findMany({
      where: {
        expense: {
          groupId: ctx.user.activeGroupId,
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

  getBalances: protectedProcedure.query(async ({ ctx }) => {
    const balances = generateDebtsForUser(ctx.user.activeGroupId, ctx.user.id);
    return balances;
  }),

  create: protectedProcedure.input(GroupCreateInputSchema).mutation(async ({ input }) => {
    const group = await createGroup(input);
    return group;
  }),

  changeCurrent: protectedProcedure.input(z.object({ groupId: z.string().cuid() })).mutation(async ({ input, ctx }) => {
    const group = await changeCurrentGroup(input.groupId, ctx.user.id);
    return group;
  }),

  addUser: protectedProcedure.input(z.object({ userId: z.string() })).mutation(async ({ input, ctx }) => {
    const group = await addUserToGroup(ctx.user.activeGroupId, input.userId);
    return group;
  }),
});
