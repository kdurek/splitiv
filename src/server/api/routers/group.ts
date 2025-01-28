import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, t } from '@/server/api/trpc';
import { generateBalances } from '@/server/utils/generateBalances';
import { generateDebts } from '@/server/utils/generateDebts';
import { generateDebtsForUser } from '@/server/utils/generateDebtsForUser';

const checkGroupMembership = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.activeGroupId) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Aktywna grupa nie została ustawiona',
    });
  }

  const group = await ctx.db.group.findUnique({
    where: { id: ctx.user?.activeGroupId },
    include: {
      members: {
        where: {
          userId: ctx.user?.id,
        },
      },
    },
  });

  if (!group) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Nie masz uprawnień do wykonania tej operacji',
    });
  }

  return next();
});

export const groupRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.group.findMany({
      where: {
        members: {
          some: {
            userId: ctx.user.id,
          },
        },
      },
    });

    return groups;
  }),

  current: protectedProcedure.unstable_concat(checkGroupMembership).query(async ({ ctx }) => {
    const group = await ctx.db.group.findUnique({
      where: { id: ctx.user.activeGroupId },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            user: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!group) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono grupy',
      });
    }

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

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const group = await ctx.db.group.create({
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

      return group;
    }),

  changeCurrent: protectedProcedure.input(z.object({ groupId: z.string().cuid() })).mutation(async ({ input, ctx }) => {
    const user = await ctx.db.user.update({
      where: { id: ctx.user.id },
      data: {
        activeGroupId: input.groupId,
      },
    });

    return user;
  }),

  addUser: protectedProcedure.input(z.object({ userId: z.string() })).mutation(async ({ input, ctx }) => {
    const group = await ctx.db.userGroup.create({
      data: {
        groupId: ctx.user.activeGroupId,
        userId: input.userId,
      },
    });

    return group;
  }),
});
