import webPush from 'web-push';

import { env } from '@/env';
import { db } from '@/server/db';

export async function sendPush(userIds: string | string[], title: string, body: string) {
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
