// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;
type UserCtx = { id: string; name?: string; activeOrganizationId: string | null };

import { expense, expenseDebt, expenseLog, member } from "@repo/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { ulid } from "ulid";

import { canDeleteExpense, canSettleDebt, canUndoLog } from "../../lib/permissions";
import { dispatchNotification } from "../notifications/events";

export async function createExpenseHandler(
  db: Db,
  user: UserCtx,
  data: {
    title: string;
    description?: string;
    payerId: string;
    amount: string;
    debts: { debtorId: string; amount: string }[];
  },
) {
  const groupId = user.activeOrganizationId;
  if (!groupId) throw new Error("No active group");

  const debtSum = data.debts.reduce((acc, d) => acc + parseFloat(d.amount), 0).toFixed(2);
  if (debtSum !== parseFloat(data.amount).toFixed(2)) {
    throw new Error("Debt amounts must sum to the total expense amount");
  }

  const members = await db
    .select({ userId: member.userId })
    .from(member)
    .where(eq(member.organizationId, groupId));
  const memberIds = new Set(members.map((m: { userId: string }) => m.userId));

  if (!memberIds.has(data.payerId)) {
    throw new Error("Payer is not a member of the active group");
  }
  for (const debt of data.debts) {
    if (!memberIds.has(debt.debtorId)) {
      throw new Error("Debtor is not a member of the active group");
    }
  }

  const expenseId = ulid();

  const recipientIds = data.debts.map((d) => d.debtorId).filter((id) => id !== user.id);
  const uniqueRecipientIds = [...new Set(recipientIds)];

  await db.transaction(async (tx: Db) => {
    await tx.insert(expense).values({
      id: expenseId,
      name: data.title,
      description: data.description ?? null,
      payerId: data.payerId,
      amount: data.amount,
      groupId,
    });

    await tx.insert(expenseDebt).values(
      data.debts.map((debt: { debtorId: string; amount: string }) => ({
        id: ulid(),
        expenseId,
        debtorId: debt.debtorId,
        amount: debt.amount,
        settled: debt.debtorId === data.payerId ? debt.amount : "0",
      })),
    );
  });

  await dispatchNotification(db, {
    type: "expense_created",
    orgId: groupId,
    actorName: user.name ?? "Ktoś",
    expenseName: data.title,
    amount: data.amount,
    expenseId,
    recipientIds: uniqueRecipientIds,
  });

  return { expenseId };
}

export async function settleDebtHandler(
  db: Db,
  user: UserCtx,
  data: { debtId: string; amount: string },
) {
  const [debt] = await db
    .select({
      id: expenseDebt.id,
      debtorId: expenseDebt.debtorId,
      amount: expenseDebt.amount,
      settled: expenseDebt.settled,
      expenseId: expenseDebt.expenseId,
    })
    .from(expenseDebt)
    .where(eq(expenseDebt.id, data.debtId))
    .limit(1);

  if (!debt) throw new Error("Debt not found");

  const [expenseData] = await db
    .select({ payerId: expense.payerId, groupId: expense.groupId })
    .from(expense)
    .where(eq(expense.id, debt.expenseId))
    .limit(1);

  if (!expenseData) throw new Error("Expense not found");

  const [ownerMember] = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.organizationId, expenseData.groupId), eq(member.role, "owner")))
    .limit(1);

  if (!canSettleDebt(user.id, debt.debtorId, expenseData.payerId, ownerMember?.userId ?? "")) {
    throw new Error("Not authorized to settle this debt");
  }

  const remaining = parseFloat(debt.amount) - parseFloat(debt.settled);
  const settleAmount = parseFloat(data.amount);

  if (settleAmount <= 0 || settleAmount > remaining) {
    throw new Error("Invalid settlement amount");
  }

  await db.transaction(async (tx: Db) => {
    await tx.insert(expenseLog).values({ id: ulid(), debtId: debt.id, amount: data.amount });
    await tx
      .update(expenseDebt)
      .set({ settled: sql`${expenseDebt.settled} + ${data.amount}` })
      .where(eq(expenseDebt.id, debt.id));
  });
}

export async function settleDebtsHandler(
  db: Db,
  user: UserCtx,
  data: { debts: { debtId: string; amount: string }[] },
) {
  for (const item of data.debts) {
    const [debt] = await db
      .select({
        debtorId: expenseDebt.debtorId,
        amount: expenseDebt.amount,
        settled: expenseDebt.settled,
        expenseId: expenseDebt.expenseId,
      })
      .from(expenseDebt)
      .where(eq(expenseDebt.id, item.debtId))
      .limit(1);

    if (!debt) throw new Error(`Debt ${item.debtId} not found`);

    const [expenseData] = await db
      .select({ payerId: expense.payerId, groupId: expense.groupId })
      .from(expense)
      .where(eq(expense.id, debt.expenseId))
      .limit(1);

    if (!expenseData) throw new Error("Expense not found");

    const [ownerMember] = await db
      .select({ userId: member.userId })
      .from(member)
      .where(and(eq(member.organizationId, expenseData.groupId), eq(member.role, "owner")))
      .limit(1);

    if (!canSettleDebt(user.id, debt.debtorId, expenseData.payerId, ownerMember?.userId ?? "")) {
      throw new Error("Not authorized");
    }

    const remaining = parseFloat(debt.amount) - parseFloat(debt.settled);
    const settleAmount = parseFloat(item.amount);
    if (settleAmount <= 0 || settleAmount > remaining) {
      throw new Error("Invalid settlement amount");
    }
  }

  await db.transaction(async (tx: Db) => {
    for (const item of data.debts) {
      await tx.insert(expenseLog).values({ id: ulid(), debtId: item.debtId, amount: item.amount });
      await tx
        .update(expenseDebt)
        .set({ settled: sql`${expenseDebt.settled} + ${item.amount}` })
        .where(eq(expenseDebt.id, item.debtId));
    }
  });
}

export async function undoDebtLogHandler(db: Db, user: UserCtx, data: { logId: string }) {
  const [log] = await db
    .select({ id: expenseLog.id, amount: expenseLog.amount, debtId: expenseLog.debtId })
    .from(expenseLog)
    .where(eq(expenseLog.id, data.logId))
    .limit(1);

  if (!log) throw new Error("Log not found");

  const [debt] = await db
    .select({
      id: expenseDebt.id,
      debtorId: expenseDebt.debtorId,
      expenseId: expenseDebt.expenseId,
    })
    .from(expenseDebt)
    .where(eq(expenseDebt.id, log.debtId))
    .limit(1);

  if (!debt) throw new Error("Debt not found");

  const [expenseData] = await db
    .select({ payerId: expense.payerId, groupId: expense.groupId })
    .from(expense)
    .where(eq(expense.id, debt.expenseId))
    .limit(1);

  if (!expenseData) throw new Error("Expense not found");

  const [ownerMember] = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.organizationId, expenseData.groupId), eq(member.role, "owner")))
    .limit(1);

  if (!canUndoLog(user.id, debt.debtorId, expenseData.payerId, ownerMember?.userId ?? "")) {
    throw new Error("Not authorized to undo this log");
  }

  const [mostRecentLog] = await db
    .select({ id: expenseLog.id })
    .from(expenseLog)
    .where(eq(expenseLog.debtId, log.debtId))
    .orderBy(desc(expenseLog.createdAt))
    .limit(1);

  if (!mostRecentLog || mostRecentLog.id !== data.logId) {
    throw new Error("Only the most recent log entry can be undone");
  }

  await db.transaction(async (tx: Db) => {
    await tx.delete(expenseLog).where(eq(expenseLog.id, data.logId));
    await tx
      .update(expenseDebt)
      .set({ settled: sql`${expenseDebt.settled} - ${log.amount}` })
      .where(eq(expenseDebt.id, debt.id));
  });
}

export async function deleteExpenseHandler(db: Db, user: UserCtx, data: { expenseId: string }) {
  const [expenseData] = await db
    .select({ payerId: expense.payerId, groupId: expense.groupId })
    .from(expense)
    .where(eq(expense.id, data.expenseId))
    .limit(1);

  if (!expenseData) throw new Error("Expense not found");

  const [ownerMember] = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.organizationId, expenseData.groupId), eq(member.role, "owner")))
    .limit(1);

  const [debtorCheck] = await db
    .select({ one: sql`1` })
    .from(expenseDebt)
    .where(and(eq(expenseDebt.expenseId, data.expenseId), eq(expenseDebt.debtorId, user.id)))
    .limit(1);

  if (!canDeleteExpense(user.id, expenseData.payerId, ownerMember?.userId ?? "", !!debtorCheck)) {
    throw new Error("Not authorized to delete this expense");
  }

  const [logCheck] = await db
    .select({ one: sql`1` })
    .from(expenseLog)
    .innerJoin(expenseDebt, eq(expenseDebt.id, expenseLog.debtId))
    .where(eq(expenseDebt.expenseId, data.expenseId))
    .limit(1);

  if (logCheck) throw new Error("Cannot delete expense with recorded payments");

  await db.delete(expense).where(eq(expense.id, data.expenseId));
}
