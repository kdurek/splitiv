import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { hashPassword } from '@/server/utils/auth';

export const userRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany();

    return users;
  }),

  current: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono użytkownika',
      });
    }

    return user;
  }),

  byId: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nie znaleziono użytkownika',
        });
      }

      return user;
    }),

  listNotInCurrentGroup: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      where: {
        groups: {
          none: {
            groupId: ctx.user.activeGroupId,
          },
        },
      },
    });
    return users;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name: input.name,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });

      return user;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hashPassword(input.password);

      await ctx.db.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
    }),
});
