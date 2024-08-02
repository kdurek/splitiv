import { TRPCError } from '@trpc/server';
import type { UserUpdateInputSchema } from 'prisma/generated/zod';

import { db } from '@/server/db';

import { hashPassword } from './auth';

export const getAllUsers = async () => {
  const users = await db.user.findMany();

  return users;
};

export const getUserById = async (userId?: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Nie znaleziono użytkownika',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { googleId, ...safeUser } = user;

  return safeUser;
};

export const updateUser = async (userId: string, userData: typeof UserUpdateInputSchema._type) => {
  const updatedUser = await db.user.update({
    where: {
      id: userId,
    },
    data: userData,
  });

  return updatedUser;
};

export const changePassword = async (userId: string, newPassword: string) => {
  const hashedPassword = await hashPassword(newPassword);
  const updatedUser = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
  return updatedUser;
};

export const changeCurrentGroup = async (groupId: string, userId: string) => {
  const user = await db.user.update({
    where: { id: userId },
    data: {
      activeGroupId: groupId,
    },
  });

  return user;
};

export const checkIsSameUser = async (firstUserId: string, secondUserId: string) => {
  if (firstUserId !== secondUserId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Nie masz uprawnień do wykonania tej operacji',
    });
  }
};
