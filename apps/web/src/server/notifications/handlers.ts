// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

import { notification, pushSubscription } from "@repo/db/schema";
import { and, count, desc, eq, isNull, inArray } from "drizzle-orm";
import { ulid } from "ulid";

export async function getNotificationsHandler(
  db: Db,
  userId: string,
  organizationId: string | null,
) {
  if (!organizationId) return [];

  return db
    .select({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      expenseId: notification.expenseId,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    })
    .from(notification)
    .where(and(eq(notification.userId, userId), eq(notification.organizationId, organizationId)))
    .orderBy(desc(notification.createdAt))
    .limit(100);
}

export async function getUnreadCountHandler(
  db: Db,
  userId: string,
  organizationId: string | null,
): Promise<{ count: number }> {
  if (!organizationId) return { count: 0 };

  const [result] = await db
    .select({ count: count() })
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.organizationId, organizationId),
        isNull(notification.readAt),
      ),
    );

  return { count: Number(result?.count ?? 0) };
}

export async function markNotificationReadHandler(db: Db, userId: string, notificationId: string) {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId),
        isNull(notification.readAt),
      ),
    );
}

export async function markAllNotificationsReadHandler(
  db: Db,
  userId: string,
  organizationId: string | null,
) {
  if (!organizationId) return;

  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.organizationId, organizationId),
        isNull(notification.readAt),
      ),
    );
}

export async function subscribePushHandler(
  db: Db,
  userId: string,
  data: { endpoint: string; p256dh: string; auth: string },
) {
  await db
    .insert(pushSubscription)
    .values({
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userId,
    })
    .onConflictDoUpdate({
      target: pushSubscription.endpoint,
      set: { p256dh: data.p256dh, auth: data.auth, userId },
    });
}

export async function unsubscribePushHandler(db: Db, userId: string, endpoint: string) {
  await db
    .delete(pushSubscription)
    .where(and(eq(pushSubscription.endpoint, endpoint), eq(pushSubscription.userId, userId)));
}

export async function insertNotificationsHandler(
  db: Db,
  rows: {
    userId: string;
    organizationId: string;
    type: string;
    title: string;
    body: string;
    expenseId?: string | null;
  }[],
) {
  if (rows.length === 0) return;

  await db.insert(notification).values(
    rows.map((row) => ({
      id: ulid(),
      userId: row.userId,
      organizationId: row.organizationId,
      type: row.type,
      title: row.title,
      body: row.body,
      expenseId: row.expenseId ?? null,
    })),
  );
}

export async function getPushSubscriptionsForUsers(db: Db, userIds: string[]) {
  if (userIds.length === 0) return [];

  return db
    .select({
      endpoint: pushSubscription.endpoint,
      p256dh: pushSubscription.p256dh,
      auth: pushSubscription.auth,
      userId: pushSubscription.userId,
    })
    .from(pushSubscription)
    .where(inArray(pushSubscription.userId, userIds));
}

export async function deletePushSubscriptionsByEndpoints(db: Db, endpoints: string[]) {
  if (endpoints.length === 0) return;

  await db.delete(pushSubscription).where(inArray(pushSubscription.endpoint, endpoints));
}

export async function checkPushSubscriptionOwnership(
  db: Db,
  userId: string,
  endpoint: string,
): Promise<boolean> {
  const [row] = await db
    .select({ endpoint: pushSubscription.endpoint })
    .from(pushSubscription)
    .where(and(eq(pushSubscription.endpoint, endpoint), eq(pushSubscription.userId, userId)))
    .limit(1);
  return !!row;
}
