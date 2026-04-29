import "@tanstack/react-start/server-only";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

import { notification } from "@repo/db/schema";
import { ulid } from "ulid";

import { sendPushToUsers } from "./send";

export type NotificationEvent = {
  type: "expense_created";
  orgId: string;
  actorName: string;
  expenseName: string;
  amount: string;
  expenseId: string;
  recipientIds: string[];
};

type DispatchRow = {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  body: string;
  expenseId: string | null;
  url: string;
};

function formatAmount(amount: string) {
  return Number(amount).toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildRows(event: NotificationEvent): DispatchRow[] {
  const body = `${event.actorName} dodał ${event.expenseName} (${formatAmount(event.amount)} zł)`;
  return event.recipientIds.map((userId) => ({
    id: ulid(),
    userId,
    organizationId: event.orgId,
    type: event.type,
    title: "Nowy wydatek",
    body,
    expenseId: event.expenseId,
    url: `/expenses/${event.expenseId}`,
  }));
}

export async function dispatchNotification(db: Db, event: NotificationEvent) {
  const rows = buildRows(event);
  if (rows.length === 0) return;

  await db.insert(notification).values(
    rows.map(({ id, userId, organizationId, type, title, body, expenseId }) => ({
      id,
      userId,
      organizationId,
      type,
      title,
      body,
      expenseId,
    })),
  );

  void Promise.allSettled(
    rows.map((row) =>
      sendPushToUsers([row.userId], {
        title: row.title,
        body: row.body,
        url: row.url,
        notificationId: row.id,
      }),
    ),
  );
}
