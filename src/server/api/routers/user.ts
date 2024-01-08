import { Gender } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),

  getById: protectedProcedure.input(z.object({ userId: z.string().cuid2() })).query(async ({ input, ctx }) => {
    return ctx.db.user.findUnique({
      where: {
        id: input.userId,
      },
    });
  }),

  getAllNotInCurrentGroup: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      where: {
        groups: {
          none: {
            groupId: ctx.session.activeGroupId,
          },
        },
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2(),
        name: z.string().optional(),
        gender: z.nativeEnum(Gender).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          name: input.name,
          gender: input.gender,
        },
      });
    }),
});
