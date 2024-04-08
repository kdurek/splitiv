import { TRPCClientError } from '@trpc/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { sendPush } from '@/server/utils/push';

export const pushSubscriptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        pushSubscription: z.object({
          endpoint: z.string().optional(),
          keys: z
            .object({
              auth: z.string().optional(),
              p256dh: z.string().optional(),
            })
            .optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        !input.pushSubscription.endpoint ||
        !input.pushSubscription.keys?.auth ||
        !input.pushSubscription.keys?.p256dh
      ) {
        throw new TRPCClientError('Invalid subscription data.');
      }
      const pushSubscription = await ctx.db.pushSubscription.create({
        data: {
          userId: ctx.session.userId,
          endpoint: input.pushSubscription.endpoint,
          auth: input.pushSubscription.keys.auth,
          p256dh: input.pushSubscription.keys.p256dh,
        },
      });
      return pushSubscription;
    }),

  delete: protectedProcedure.input(z.object({ endpoint: z.string() })).mutation(async ({ input, ctx }) => {
    const pushSubscription = await ctx.db.pushSubscription.delete({
      where: {
        endpoint: input.endpoint,
      },
    });
    return pushSubscription;
  }),

  sendNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return sendPush(ctx.session.userId, input.title, input.body);
    }),
});
