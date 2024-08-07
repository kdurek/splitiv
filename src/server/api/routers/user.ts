import { UserUpdateInputSchema } from 'prisma/generated/zod';
import { z } from 'zod';

import { getUsersNotInGroup } from '@/server/api/services/group';
import { changePassword, checkIsSameUser, getAllUsers, getUserById, updateUser } from '@/server/api/services/user';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const users = await getAllUsers();
    return users;
  }),

  current: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    return user;
  }),

  byId: protectedProcedure.input(z.object({ userId: z.string().cuid().optional() })).query(async ({ input }) => {
    const user = await getUserById(input.userId);
    return user;
  }),

  listNotInCurrentGroup: protectedProcedure.query(async ({ ctx }) => {
    const users = await getUsersNotInGroup(ctx.user.activeGroupId);
    return users;
  }),

  update: protectedProcedure
    .input(z.object({ userId: z.string().cuid(), userData: UserUpdateInputSchema }))
    .mutation(async ({ ctx, input }) => {
      await checkIsSameUser(ctx.user.id, input.userId);
      const user = await updateUser(input.userId, input.userData);
      return user;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await checkIsSameUser(ctx.user.id, input.userId);
      await changePassword(input.userId, input.password);
    }),
});
