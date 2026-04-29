import { notification, organization, pushSubscription, user } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDb } from "../../test/db";
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  insertNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
  subscribePushHandler,
  unsubscribePushHandler,
} from "./handlers";

const U1 = "user-alice";
const U2 = "user-bob";
const G1 = "group-main";
const G2 = "group-other";

type TestDb = Awaited<ReturnType<typeof createTestDb>>["db"];

let db: TestDb;
let truncate: () => Promise<void>;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  ({ db, truncate, cleanup } = await createTestDb());
}, 60_000);

afterAll(async () => {
  await cleanup();
});

beforeEach(async () => {
  await truncate();

  await db.insert(user).values([
    { id: U1, name: "Alice", email: "alice@test.com", emailVerified: true },
    { id: U2, name: "Bob", email: "bob@test.com", emailVerified: true },
  ]);
  await db.insert(organization).values([
    { id: G1, name: "Group Main", slug: "group-main", createdAt: new Date() },
    { id: G2, name: "Group Other", slug: "group-other", createdAt: new Date() },
  ]);
});

// Seed a notification row directly for use in other tests
function seedNotif(
  overrides: Partial<typeof notification.$inferInsert> = {},
): typeof notification.$inferInsert {
  return {
    id: "notif-1",
    userId: U1,
    organizationId: G1,
    type: "expense_created",
    title: "Nowy wydatek",
    body: "Alice dodał Lunch (10.00 zł)",
    expenseId: null,
    readAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getNotificationsHandler
// ---------------------------------------------------------------------------

describe("getNotificationsHandler", () => {
  it("returns empty array when no notifications", async () => {
    const result = await getNotificationsHandler(db, U1, G1);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when organizationId is null", async () => {
    await db.insert(notification).values(seedNotif());
    const result = await getNotificationsHandler(db, U1, null);
    expect(result).toHaveLength(0);
  });

  it("returns notifications for user in org, ordered newest first", async () => {
    const older = new Date("2025-01-01T10:00:00Z");
    const newer = new Date("2025-01-02T10:00:00Z");
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "notif-old", createdAt: older }),
        seedNotif({ id: "notif-new", createdAt: newer }),
      ]);

    const result = await getNotificationsHandler(db, U1, G1);
    expect(result).toHaveLength(2);
    expect((result[0] as { id: string }).id).toBe("notif-new");
    expect((result[1] as { id: string }).id).toBe("notif-old");
  });

  it("does not return other user's notifications", async () => {
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "notif-alice", userId: U1 }),
        seedNotif({ id: "notif-bob", userId: U2 }),
      ]);

    const result = await getNotificationsHandler(db, U1, G1);
    expect(result).toHaveLength(1);
    expect((result[0] as { id: string }).id).toBe("notif-alice");
  });

  it("does not return notifications from a different org", async () => {
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "notif-g1", organizationId: G1 }),
        seedNotif({ id: "notif-g2", organizationId: G2 }),
      ]);

    const result = await getNotificationsHandler(db, U1, G1);
    expect(result).toHaveLength(1);
    expect((result[0] as { id: string }).id).toBe("notif-g1");
  });

  it("returns readAt as null for unread and non-null for read", async () => {
    const now = new Date();
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "notif-unread", readAt: null }),
        seedNotif({ id: "notif-read", readAt: now }),
      ]);

    const result = await getNotificationsHandler(db, U1, G1);
    type Row = { id: string; readAt: Date | null };
    const unread = (result as Row[]).find((n) => n.id === "notif-unread");
    const read = (result as Row[]).find((n) => n.id === "notif-read");
    expect(unread?.readAt).toBeNull();
    expect(read?.readAt).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getUnreadCountHandler
// ---------------------------------------------------------------------------

describe("getUnreadCountHandler", () => {
  it("returns 0 when no notifications", async () => {
    const result = await getUnreadCountHandler(db, U1, G1);
    expect(result.count).toBe(0);
  });

  it("returns 0 when organizationId is null", async () => {
    await db.insert(notification).values(seedNotif());
    const result = await getUnreadCountHandler(db, U1, null);
    expect(result.count).toBe(0);
  });

  it("counts only unread notifications", async () => {
    const now = new Date();
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "n1" }),
        seedNotif({ id: "n2" }),
        seedNotif({ id: "n3", readAt: now }),
      ]);

    const result = await getUnreadCountHandler(db, U1, G1);
    expect(result.count).toBe(2);
  });

  it("does not count other user's unread", async () => {
    await db
      .insert(notification)
      .values([seedNotif({ id: "n-alice", userId: U1 }), seedNotif({ id: "n-bob", userId: U2 })]);

    const result = await getUnreadCountHandler(db, U1, G1);
    expect(result.count).toBe(1);
  });

  it("does not count notifications from another org", async () => {
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "n-g1", organizationId: G1 }),
        seedNotif({ id: "n-g2", organizationId: G2 }),
      ]);

    const result = await getUnreadCountHandler(db, U1, G1);
    expect(result.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// markNotificationReadHandler
// ---------------------------------------------------------------------------

describe("markNotificationReadHandler", () => {
  it("sets readAt on an unread notification", async () => {
    await db.insert(notification).values(seedNotif({ id: "n1" }));

    await markNotificationReadHandler(db, U1, "n1");

    const [row] = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.id, "n1"));
    expect(row.readAt).not.toBeNull();
  });

  it("is idempotent — does not throw if already read", async () => {
    await db.insert(notification).values(seedNotif({ id: "n1", readAt: new Date() }));
    await expect(markNotificationReadHandler(db, U1, "n1")).resolves.not.toThrow();
  });

  it("does not mark another user's notification as read", async () => {
    await db.insert(notification).values(seedNotif({ id: "n1", userId: U2 }));

    await markNotificationReadHandler(db, U1, "n1");

    const [row] = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.id, "n1"));
    expect(row.readAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// markAllNotificationsReadHandler
// ---------------------------------------------------------------------------

describe("markAllNotificationsReadHandler", () => {
  it("marks all unread notifications for user+org as read", async () => {
    await db
      .insert(notification)
      .values([seedNotif({ id: "n1" }), seedNotif({ id: "n2" }), seedNotif({ id: "n3" })]);

    await markAllNotificationsReadHandler(db, U1, G1);

    const rows = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.userId, U1));
    expect(rows.every((r) => r.readAt !== null)).toBe(true);
  });

  it("does not change readAt of already-read notifications", async () => {
    const original = new Date("2025-01-01T00:00:00Z");
    await db.insert(notification).values(seedNotif({ id: "n1", readAt: original }));

    await markAllNotificationsReadHandler(db, U1, G1);

    const [row] = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.id, "n1"));
    expect(row.readAt?.getTime()).toBe(original.getTime());
  });

  it("does not mark other user's notifications", async () => {
    await db
      .insert(notification)
      .values([seedNotif({ id: "n-alice", userId: U1 }), seedNotif({ id: "n-bob", userId: U2 })]);

    await markAllNotificationsReadHandler(db, U1, G1);

    const [bobRow] = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.id, "n-bob"));
    expect(bobRow.readAt).toBeNull();
  });

  it("does not mark notifications from another org", async () => {
    await db
      .insert(notification)
      .values([
        seedNotif({ id: "n-g1", organizationId: G1 }),
        seedNotif({ id: "n-g2", organizationId: G2 }),
      ]);

    await markAllNotificationsReadHandler(db, U1, G1);

    const [g2Row] = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.id, "n-g2"));
    expect(g2Row.readAt).toBeNull();
  });

  it("is a no-op when organizationId is null", async () => {
    await db.insert(notification).values(seedNotif({ id: "n1" }));
    await expect(markAllNotificationsReadHandler(db, U1, null)).resolves.not.toThrow();

    const [row] = await db
      .select({ readAt: notification.readAt })
      .from(notification)
      .where(eq(notification.id, "n1"));
    expect(row.readAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// subscribePushHandler / unsubscribePushHandler
// ---------------------------------------------------------------------------

describe("subscribePushHandler", () => {
  const SUB = {
    endpoint: "https://fcm.example.com/endpoint-1",
    p256dh: "p256dh-key-abc",
    auth: "auth-secret-abc",
  };

  it("inserts a new subscription", async () => {
    await subscribePushHandler(db, U1, SUB);

    const [row] = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.endpoint, SUB.endpoint));
    expect(row.userId).toBe(U1);
    expect(row.p256dh).toBe(SUB.p256dh);
    expect(row.auth).toBe(SUB.auth);
  });

  it("upserts — updates keys and userId on conflict", async () => {
    await subscribePushHandler(db, U1, SUB);

    const updated = { ...SUB, p256dh: "p256dh-new", auth: "auth-new" };
    await subscribePushHandler(db, U2, updated);

    const [row] = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.endpoint, SUB.endpoint));
    expect(row.p256dh).toBe("p256dh-new");
    expect(row.auth).toBe("auth-new");
    expect(row.userId).toBe(U2);
  });

  it("allows multiple subscriptions per user (different endpoints)", async () => {
    await subscribePushHandler(db, U1, SUB);
    await subscribePushHandler(db, U1, { ...SUB, endpoint: "https://fcm.example.com/endpoint-2" });

    const rows = await db.select().from(pushSubscription).where(eq(pushSubscription.userId, U1));
    expect(rows).toHaveLength(2);
  });
});

describe("unsubscribePushHandler", () => {
  const ENDPOINT = "https://fcm.example.com/endpoint-del";

  beforeEach(async () => {
    await subscribePushHandler(db, U1, { endpoint: ENDPOINT, p256dh: "key", auth: "secret" });
  });

  it("deletes subscription belonging to user", async () => {
    await unsubscribePushHandler(db, U1, ENDPOINT);

    const rows = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.endpoint, ENDPOINT));
    expect(rows).toHaveLength(0);
  });

  it("does not delete subscription belonging to a different user", async () => {
    // Re-seed under U2
    await subscribePushHandler(db, U2, {
      endpoint: "https://fcm.example.com/endpoint-u2",
      p256dh: "key",
      auth: "secret",
    });

    await unsubscribePushHandler(db, U1, "https://fcm.example.com/endpoint-u2");

    const rows = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.endpoint, "https://fcm.example.com/endpoint-u2"));
    expect(rows).toHaveLength(1);
  });

  it("is a no-op when endpoint does not exist", async () => {
    await expect(
      unsubscribePushHandler(db, U1, "https://fcm.example.com/nonexistent"),
    ).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// insertNotificationsHandler
// ---------------------------------------------------------------------------

describe("insertNotificationsHandler", () => {
  it("inserts multiple notification rows", async () => {
    await insertNotificationsHandler(db, [
      {
        userId: U1,
        organizationId: G1,
        type: "expense_created",
        title: "Nowy wydatek",
        body: "Alice dodał Lunch (10.00 zł)",
      },
      {
        userId: U2,
        organizationId: G1,
        type: "expense_created",
        title: "Nowy wydatek",
        body: "Alice dodał Lunch (10.00 zł)",
      },
    ]);

    const rows = await db.select().from(notification);
    expect(rows).toHaveLength(2);
  });

  it("is a no-op for empty array", async () => {
    await expect(insertNotificationsHandler(db, [])).resolves.not.toThrow();
    const rows = await db.select().from(notification);
    expect(rows).toHaveLength(0);
  });

  it("generates unique ids for each row", async () => {
    await insertNotificationsHandler(db, [
      {
        userId: U1,
        organizationId: G1,
        type: "expense_created",
        title: "T",
        body: "B",
      },
      {
        userId: U1,
        organizationId: G1,
        type: "expense_created",
        title: "T",
        body: "B",
      },
    ]);

    const rows = await db.select({ id: notification.id }).from(notification);
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(2);
  });
});
