import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { passwordSchema } from '@/lib/validations/auth';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { auth } from '@/server/auth';

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
        currentPassword: z.string(),
        password: passwordSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hasPassword = await ctx.db.account.count({
        where: {
          userId: ctx.user.id,
          password: {
            not: null,
          },
        },
      });

      if (hasPassword) {
        if (!input.currentPassword) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Podaj aktualne hasło',
          });
        }

        await auth.api.changePassword({
          headers: ctx.headers,
          body: {
            currentPassword: input.currentPassword,
            newPassword: input.password,
            revokeOtherSessions: true,
          },
        });
      } else {
        await auth.api.setPassword({
          headers: ctx.headers,
          body: {
            newPassword: input.password,
          },
        });
      }
    }),
});
