import { TRPCError } from '@trpc/server';
import webPush from 'web-push';

import { env } from '@/env';
import { db } from '@/server/db';

export const createPushSubscription = async (
  userId: string,
  {
    endpoint,
    keys,
  }: {
    endpoint?: string;
    keys?: {
      auth: string;
      p256dh: string;
    };
  },
) => {
  if (!endpoint || !keys) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Nieprawidłowe dane subskrypcji',
    });
  }

  const newPushSubscription = await db.pushSubscription.create({
    data: {
      userId,
      endpoint,
      auth: keys.auth,
      p256dh: keys.p256dh,
    },
  });
  return newPushSubscription;
};

export const deletePushSubscriptionByEndpoint = async (endpoint: string) => {
  const pushSubscription = await db.pushSubscription.delete({
    where: {
      endpoint,
    },
  });
  return pushSubscription;
};

export async function sendPush(userIds: string | string[], title: string, body: string, url?: string) {
  webPush.setVapidDetails(
    `mailto:${env.WEB_PUSH_EMAIL}`,
    env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    env.WEB_PUSH_PRIVATE_KEY,
  );
  const users = typeof userIds === 'string' ? [userIds] : userIds;
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: {
        id: { in: users },
      },
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
            title,
            body,
            url,
          }),
        );
      } catch (err) {
        if (err instanceof webPush.WebPushError) {
          if (err.statusCode === 410) {
            await db.pushSubscription.delete({
              where: {
                endpoint: subscription.endpoint,
              },
            });
          }
        }
      }
    }),
  );
}
