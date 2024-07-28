import { TRPCError } from '@trpc/server';
import type { GroupCreateInputSchema } from 'prisma/generated/zod';

import { db } from '@/server/db';

export const getAllGroups = async (userId?: string) => {
  const groups = await db.group.findMany({
    where: { members: { some: { userId } } },
  });

  return groups;
};

export const getGroupById = async (groupId?: string) => {
  const group = await db.group.findUnique({
    where: { id: groupId },
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

  return group;
};

export const createGroup = async (groupData: typeof GroupCreateInputSchema._type) => {
  const group = await db.group.create({
    data: groupData,
  });

  return group;
};

export const checkGroupMembership = async (groupId: string, userId: string) => {
  const group = await db.group.findUnique({
    where: { id: groupId },
    include: { members: { where: { userId } } },
  });

  if (!group) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Nie masz uprawnień do wykonania tej operacji',
    });
  }
};

export const getUsersNotInGroup = async (groupId?: string) => {
  const users = await db.user.findMany({
    where: {
      groups: {
        none: {
          groupId,
        },
      },
    },
  });

  return users;
};

export const addUserToGroup = async (groupId: string, userId: string) => {
  const group = await db.userGroup.create({
    data: {
      groupId,
      userId,
    },
  });

  return group;
};
