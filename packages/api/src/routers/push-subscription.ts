import { protectedProcedure } from "@splitiv/api";
import {
  createPushSubscription,
  deletePushSubscriptionByEndpoint,
  sendPush,
} from "@splitiv/api/utils/push-subscription";
import { z } from "zod";

export const pushSubscriptionRouter = {
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
      })
    )
    .handler(async ({ input, context }) => {
      const pushSubscription = await createPushSubscription(
        context.session.userId,
        input.pushSubscription
      );
      return pushSubscription;
    }),

  delete: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .handler(async ({ input }) => {
      const pushSubscription = await deletePushSubscriptionByEndpoint(
        input.endpoint
      );
      return pushSubscription;
    }),

  sendTestNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
      })
    )
    .handler(({ input, context }) =>
      sendPush(context.session.userId, input.title, input.body)
    ),
};
