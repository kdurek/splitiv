import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createPushSubscription, deletePushSubscriptionByEndpoint, sendPush } from '@/server/utils/push-subscription';

export const pushSubscriptionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        pushSubscription: z.object({
          endpoint: z.string().optional(),
          keys: z
            .object({
              auth: z.string(),
              p256dh: z.string(),
            })
            .optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const pushSubscription = await createPushSubscription(ctx.session.userId, input.pushSubscription);
      return pushSubscription;
    }),

  delete: protectedProcedure.input(z.object({ endpoint: z.string() })).mutation(async ({ input }) => {
    const pushSubscription = await deletePushSubscriptionByEndpoint(input.endpoint);
    return pushSubscription;
  }),

  sendTestNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return sendPush(ctx.session.userId, input.title, input.body);
    }),
});
