import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  checkPushSubscriptionOwnership,
  getNotificationsHandler,
  getUnreadCountHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
  subscribePushHandler,
  unsubscribePushHandler,
} from "./handlers";

export const $getNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) =>
    getNotificationsHandler(db, context.user.id, context.session.activeOrganizationId ?? null),
  );

export const $getUnreadNotificationCount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) =>
    getUnreadCountHandler(db, context.user.id, context.session.activeOrganizationId ?? null),
  );

export const $markNotificationRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(({ context, data }) => markNotificationReadHandler(db, context.user.id, data.id));

export const $markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(({ context }) =>
    markAllNotificationsReadHandler(
      db,
      context.user.id,
      context.session.activeOrganizationId ?? null,
    ),
  );

export const $subscribePush = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      endpoint: z.url(),
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  )
  .handler(({ context, data }) => subscribePushHandler(db, context.user.id, data));

export const $unsubscribePush = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ endpoint: z.url() }))
  .handler(({ context, data }) => unsubscribePushHandler(db, context.user.id, data.endpoint));

export const $checkPushSubscription = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ endpoint: z.url() }))
  .handler(({ context, data }) =>
    checkPushSubscriptionOwnership(db, context.user.id, data.endpoint),
  );

export const $sendTestPushNotification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sendPushToUsers } = await import("./send");
    await sendPushToUsers([context.user.id], {
      title: "Test powiadomienia 🔔",
      body: "Testowe powiadomienie z Splitiv działa poprawnie.",
      url: "/notifications",
    });
  });
