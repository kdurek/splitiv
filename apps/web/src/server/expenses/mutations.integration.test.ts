import { expense, expenseDebt, expenseLog, member, organization, user } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDb } from "../../test/db";
import {
  createExpenseHandler,
  deleteExpenseHandler,
  settleDebtHandler,
  settleDebtsHandler,
  undoDebtLogHandler,
} from "./handlers";

// IDs used across all tests
const U1 = "user-alice";
const U2 = "user-bob";
const U3 = "user-charlie";
const G1 = "group-main";

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

  // Seed minimal data: 3 users, 1 organization, all members
  await db.insert(user).values([
    { id: U1, name: "Alice", email: "alice@test.com", emailVerified: true },
    { id: U2, name: "Bob", email: "bob@test.com", emailVerified: true },
    { id: U3, name: "Charlie", email: "charlie@test.com", emailVerified: true },
  ]);
  await db
    .insert(organization)
    .values({ id: G1, name: "Test Group", slug: "test-group", createdAt: new Date() });
  await db.insert(member).values([
    { id: "m1", organizationId: G1, userId: U1, role: "owner", createdAt: new Date() },
    { id: "m2", organizationId: G1, userId: U2, role: "member", createdAt: new Date() },
    { id: "m3", organizationId: G1, userId: U3, role: "member", createdAt: new Date() },
  ]);
});

// ---------------------------------------------------------------------------
// createExpenseHandler
// ---------------------------------------------------------------------------

describe("createExpenseHandler", () => {
  it("creates expense and debts, auto-settles payer's own share", async () => {
    const { expenseId } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Groceries",
        payerId: U1,
        amount: "10.00",
        debts: [
          { debtorId: U1, amount: "5.00" },
          { debtorId: U2, amount: "5.00" },
        ],
      },
    );

    const [row] = await db.select().from(expense).where(eq(expense.id, expenseId));
    expect(row.name).toBe("Groceries");
    expect(row.amount).toBe("10.00");

    const debts = await db.select().from(expenseDebt).where(eq(expenseDebt.expenseId, expenseId));
    expect(debts).toHaveLength(2);

    const payerDebt = debts.find((d) => d.debtorId === U1);
    const bobDebt = debts.find((d) => d.debtorId === U2);

    // Payer's own share is auto-settled
    expect(payerDebt?.settled).toBe("5.00");
    // Bob's share is unsettled
    expect(bobDebt?.settled).toBe("0");
  });

  it("throws when activeOrganizationId is null", async () => {
    await expect(
      createExpenseHandler(
        db,
        { id: U1, activeOrganizationId: null },
        {
          title: "Test",
          payerId: U1,
          amount: "10.00",
          debts: [{ debtorId: U1, amount: "10.00" }],
        },
      ),
    ).rejects.toThrow("No active group");
  });

  it("throws when debt amounts do not sum to total", async () => {
    await expect(
      createExpenseHandler(
        db,
        { id: U1, activeOrganizationId: G1 },
        {
          title: "Test",
          payerId: U1,
          amount: "10.00",
          debts: [
            { debtorId: U1, amount: "4.00" },
            { debtorId: U2, amount: "4.00" },
          ],
        },
      ),
    ).rejects.toThrow("Debt amounts must sum to the total expense amount");
  });

  it("throws when payer is not a group member", async () => {
    await expect(
      createExpenseHandler(
        db,
        { id: U1, activeOrganizationId: G1 },
        {
          title: "Test",
          payerId: "outsider",
          amount: "10.00",
          debts: [{ debtorId: U1, amount: "10.00" }],
        },
      ),
    ).rejects.toThrow("Payer is not a member of the active group");
  });

  it("throws when a debtor is not a group member", async () => {
    await expect(
      createExpenseHandler(
        db,
        { id: U1, activeOrganizationId: G1 },
        {
          title: "Test",
          payerId: U1,
          amount: "10.00",
          debts: [{ debtorId: "outsider", amount: "10.00" }],
        },
      ),
    ).rejects.toThrow("Debtor is not a member of the active group");
  });
});

// ---------------------------------------------------------------------------
// settleDebtHandler
// ---------------------------------------------------------------------------

describe("settleDebtHandler", () => {
  async function seedExpenseWithDebt() {
    const { expenseId } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Lunch",
        payerId: U1,
        amount: "20.00",
        debts: [
          { debtorId: U1, amount: "10.00" },
          { debtorId: U2, amount: "10.00" },
        ],
      },
    );
    const [bobDebt] = await db.select().from(expenseDebt).where(eq(expenseDebt.debtorId, U2));
    return { expenseId, debtId: bobDebt.id };
  }

  it("records a log and updates settled amount", async () => {
    const { debtId } = await seedExpenseWithDebt();

    await settleDebtHandler(db, { id: U2, activeOrganizationId: G1 }, { debtId, amount: "5.00" });

    const [updated] = await db.select().from(expenseDebt).where(eq(expenseDebt.id, debtId));
    expect(updated.settled).toBe("5.00");

    const logs = await db.select().from(expenseLog).where(eq(expenseLog.debtId, debtId));
    expect(logs).toHaveLength(1);
    expect(logs[0].amount).toBe("5.00");
  });

  it("allows the payer to settle the debt", async () => {
    const { debtId } = await seedExpenseWithDebt();
    await expect(
      settleDebtHandler(db, { id: U1, activeOrganizationId: G1 }, { debtId, amount: "10.00" }),
    ).resolves.not.toThrow();
  });

  it("allows the group owner to settle the debt", async () => {
    // Create a separate org where U3 is owner and U1 is payer (not owner)
    const adminGroupId = "group-admin-test";
    await db
      .insert(organization)
      .values({
        id: adminGroupId,
        name: "Admin Group",
        slug: "admin-group",
        createdAt: new Date(),
      });
    await db.insert(member).values([
      {
        id: "ma1",
        organizationId: adminGroupId,
        userId: U1,
        role: "member",
        createdAt: new Date(),
      },
      {
        id: "ma2",
        organizationId: adminGroupId,
        userId: U2,
        role: "member",
        createdAt: new Date(),
      },
      { id: "ma3", organizationId: adminGroupId, userId: U3, role: "owner", createdAt: new Date() },
    ]);
    const { expenseId } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: adminGroupId },
      {
        title: "Dinner",
        payerId: U1,
        amount: "10.00",
        debts: [
          { debtorId: U1, amount: "5.00" },
          { debtorId: U2, amount: "5.00" },
        ],
      },
    );
    const [bobDebt] = await db
      .select()
      .from(expenseDebt)
      .where(and(eq(expenseDebt.expenseId, expenseId), eq(expenseDebt.debtorId, U2)));
    const adminGroupDebtId = bobDebt.id;

    await expect(
      settleDebtHandler(
        db,
        { id: U3, activeOrganizationId: adminGroupId },
        { debtId: adminGroupDebtId, amount: "5.00" },
      ),
    ).resolves.not.toThrow();
  });

  it("blocks an outsider from settling", async () => {
    const { debtId } = await seedExpenseWithDebt();
    await expect(
      settleDebtHandler(
        db,
        { id: "outsider", activeOrganizationId: G1 },
        { debtId, amount: "5.00" },
      ),
    ).rejects.toThrow("Not authorized to settle this debt");
  });

  it("throws when settle amount exceeds remaining", async () => {
    const { debtId } = await seedExpenseWithDebt();
    await expect(
      settleDebtHandler(db, { id: U2, activeOrganizationId: G1 }, { debtId, amount: "99.00" }),
    ).rejects.toThrow("Invalid settlement amount");
  });

  it("throws when settle amount is zero", async () => {
    const { debtId } = await seedExpenseWithDebt();
    await expect(
      settleDebtHandler(db, { id: U2, activeOrganizationId: G1 }, { debtId, amount: "0.00" }),
    ).rejects.toThrow("Invalid settlement amount");
  });
});

// ---------------------------------------------------------------------------
// undoDebtLogHandler
// ---------------------------------------------------------------------------

describe("undoDebtLogHandler", () => {
  async function seedDebtWithLog() {
    const { expenseId } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Party",
        payerId: U1,
        amount: "30.00",
        debts: [
          { debtorId: U1, amount: "15.00" },
          { debtorId: U2, amount: "15.00" },
        ],
      },
    );
    const [bobDebt] = await db.select().from(expenseDebt).where(eq(expenseDebt.debtorId, U2));
    await settleDebtHandler(
      db,
      { id: U2, activeOrganizationId: G1 },
      { debtId: bobDebt.id, amount: "10.00" },
    );
    const [log] = await db.select().from(expenseLog).where(eq(expenseLog.debtId, bobDebt.id));
    return { expenseId, debtId: bobDebt.id, logId: log.id };
  }

  it("removes the log and reverses the settled amount", async () => {
    const { debtId, logId } = await seedDebtWithLog();

    await undoDebtLogHandler(db, { id: U2, activeOrganizationId: G1 }, { logId });

    const [updated] = await db.select().from(expenseDebt).where(eq(expenseDebt.id, debtId));
    expect(updated.settled).toBe("0.00");

    const logs = await db.select().from(expenseLog).where(eq(expenseLog.debtId, debtId));
    expect(logs).toHaveLength(0);
  });

  it("blocks an outsider from undoing", async () => {
    const { logId } = await seedDebtWithLog();
    await expect(
      undoDebtLogHandler(db, { id: "outsider", activeOrganizationId: G1 }, { logId }),
    ).rejects.toThrow("Not authorized to undo this log");
  });

  it("throws when trying to undo a non-recent log", async () => {
    const { debtId, logId: firstLogId } = await seedDebtWithLog();
    // Add a second settlement — firstLog is no longer most recent
    await settleDebtHandler(db, { id: U2, activeOrganizationId: G1 }, { debtId, amount: "5.00" });

    await expect(
      undoDebtLogHandler(db, { id: U2, activeOrganizationId: G1 }, { logId: firstLogId }),
    ).rejects.toThrow("Only the most recent log entry can be undone");
  });
});

// ---------------------------------------------------------------------------
// deleteExpenseHandler
// ---------------------------------------------------------------------------

describe("deleteExpenseHandler", () => {
  async function seedUnsettledExpense() {
    const { expenseId } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Coffee",
        payerId: U1,
        amount: "6.00",
        debts: [
          { debtorId: U1, amount: "3.00" },
          { debtorId: U2, amount: "3.00" },
        ],
      },
    );
    return { expenseId };
  }

  it("deletes an expense with no payment logs", async () => {
    const { expenseId } = await seedUnsettledExpense();
    await deleteExpenseHandler(db, { id: U1, activeOrganizationId: G1 }, { expenseId });

    const rows = await db.select().from(expense).where(eq(expense.id, expenseId));
    expect(rows).toHaveLength(0);
  });

  it("allows a debtor to delete the expense", async () => {
    const { expenseId } = await seedUnsettledExpense();
    await expect(
      deleteExpenseHandler(db, { id: U2, activeOrganizationId: G1 }, { expenseId }),
    ).resolves.not.toThrow();
  });

  it("blocks an outsider from deleting", async () => {
    const { expenseId } = await seedUnsettledExpense();
    await expect(
      deleteExpenseHandler(db, { id: "outsider", activeOrganizationId: G1 }, { expenseId }),
    ).rejects.toThrow("Not authorized to delete this expense");
  });

  it("throws when expense has recorded payments", async () => {
    const { expenseId } = await seedUnsettledExpense();
    const [bobDebt] = await db.select().from(expenseDebt).where(eq(expenseDebt.debtorId, U2));
    await settleDebtHandler(
      db,
      { id: U2, activeOrganizationId: G1 },
      { debtId: bobDebt.id, amount: "3.00" },
    );

    await expect(
      deleteExpenseHandler(db, { id: U1, activeOrganizationId: G1 }, { expenseId }),
    ).rejects.toThrow("Cannot delete expense with recorded payments");
  });
});

// ---------------------------------------------------------------------------
// settleDebtsHandler
// ---------------------------------------------------------------------------

describe("settleDebtsHandler", () => {
  it("settles multiple debts at once", async () => {
    // Create two expenses where U2 is a debtor
    const { expenseId: e1 } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Exp1",
        payerId: U1,
        amount: "10.00",
        debts: [
          { debtorId: U1, amount: "5.00" },
          { debtorId: U2, amount: "5.00" },
        ],
      },
    );
    const { expenseId: e2 } = await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Exp2",
        payerId: U1,
        amount: "20.00",
        debts: [
          { debtorId: U1, amount: "10.00" },
          { debtorId: U2, amount: "10.00" },
        ],
      },
    );

    const [bobD1] = await db
      .select()
      .from(expenseDebt)
      .where(and(eq(expenseDebt.expenseId, e1), eq(expenseDebt.debtorId, U2)));
    const [bobD2] = await db
      .select()
      .from(expenseDebt)
      .where(and(eq(expenseDebt.expenseId, e2), eq(expenseDebt.debtorId, U2)));

    await settleDebtsHandler(
      db,
      { id: U2, activeOrganizationId: G1 },
      {
        debts: [
          { debtId: bobD1.id, amount: "5.00" },
          { debtId: bobD2.id, amount: "10.00" },
        ],
      },
    );

    const [updated1] = await db.select().from(expenseDebt).where(eq(expenseDebt.id, bobD1.id));
    const [updated2] = await db.select().from(expenseDebt).where(eq(expenseDebt.id, bobD2.id));
    expect(updated1.settled).toBe("5.00");
    expect(updated2.settled).toBe("10.00");
  });

  it("blocks settling another user's debt", async () => {
    await createExpenseHandler(
      db,
      { id: U1, activeOrganizationId: G1 },
      {
        title: "Test",
        payerId: U1,
        amount: "10.00",
        debts: [
          { debtorId: U1, amount: "5.00" },
          { debtorId: U2, amount: "5.00" },
        ],
      },
    );
    const [bobDebt] = await db.select().from(expenseDebt).where(eq(expenseDebt.debtorId, U2));

    await expect(
      settleDebtsHandler(
        db,
        { id: U3, activeOrganizationId: G1 },
        {
          debts: [{ debtId: bobDebt.id, amount: "5.00" }],
        },
      ),
    ).rejects.toThrow("Not authorized");
  });
});
