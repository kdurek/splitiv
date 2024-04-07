import { TRPCClientError } from '@trpc/client';
import webPush from 'web-push';
import { z } from 'zod';

import { env } from '@/env';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

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
      webPush.setVapidDetails(
        `mailto:${env.WEB_PUSH_EMAIL}`,
        env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
        env.WEB_PUSH_PRIVATE_KEY,
      );
      const subscriptions = await ctx.db.pushSubscription.findMany({
        where: {
          userId: ctx.session.userId,
        },
      });
      await Promise.all(
        subscriptions.map(async (subscription) => {
          try {
            await webPush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  auth: subscription.auth,
                  p256dh: subscription.p256dh,
                },
              },
              JSON.stringify({
                title: input.title,
                body: input.body,
              }),
            );
          } catch (err) {
            if (err instanceof webPush.WebPushError) {
              if (err.statusCode === 410) {
                await ctx.db.pushSubscription.delete({
                  where: {
                    endpoint: subscription.endpoint,
                  },
                });
              }
            }
          }
        }),
      );
    }),
});
