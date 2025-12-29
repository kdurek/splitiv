import { ORPCError } from "@orpc/client";
import prisma from "@splitiv/db";
import { env } from "@splitiv/env/server";
import webPush from "web-push";

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
  }
) => {
  if (!(endpoint && keys)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Nieprawidłowe dane subskrypcji",
    });
  }

  const newPushSubscription = await prisma.pushSubscription.create({
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
  const pushSubscription = await prisma.pushSubscription.delete({
    where: {
      endpoint,
    },
  });
  return pushSubscription;
};

export async function sendPush(
  userIds: string | string[],
  title: string,
  body: string,
  url?: string
) {
  webPush.setVapidDetails(
    `mailto:${env.WEB_PUSH_EMAIL}`,
    env.WEB_PUSH_PUBLIC_KEY,
    env.WEB_PUSH_PRIVATE_KEY
  );
  const users = typeof userIds === "string" ? [userIds] : userIds;
  const subscriptions = await prisma.pushSubscription.findMany({
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
          })
        );
      } catch (err) {
        if (err instanceof webPush.WebPushError && err.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: {
              endpoint: subscription.endpoint,
            },
          });
        }
      }
    })
  );
}
