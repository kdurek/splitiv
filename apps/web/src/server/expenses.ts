import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, expenseLog, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, exists, not, sql } from "drizzle-orm";

const PAGE_SIZE = 10;

export const $getExpenses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { tab: "active" | "archived"; cursor: number }) => input)
  .handler(async ({ context, data }) => {
    const currentUser = context.user;
    const { tab, cursor } = data;
    const groupId = currentUser.activeGroupId;

    if (!groupId) {
      return { items: [], nextCursor: null };
    }

    const hasUnsettledDebt = exists(
      db
        .select({ one: sql`1` })
        .from(expenseDebt)
        .where(
          and(
            eq(expenseDebt.expenseId, expense.id),
            sql`${expenseDebt.amount} > ${expenseDebt.settled}`,
          ),
        ),
    );

    const myDebt = db
      .select({
        total: sql<string>`coalesce(sum(${expenseDebt.amount} - ${expenseDebt.settled}), '0')`,
      })
      .from(expenseDebt)
      .where(
        and(
          eq(expenseDebt.expenseId, expense.id),
          eq(expenseDebt.debtorId, currentUser.id),
          sql`${expenseDebt.amount} > ${expenseDebt.settled}`,
        ),
      );

    const rows = await db
      .select({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        createdAt: expense.createdAt,
        payerName: user.name,
        myDebt: sql<string>`(${myDebt})`,
      })
      .from(expense)
      .innerJoin(user, eq(user.id, expense.payerId))
      .where(
        and(
          eq(expense.groupId, groupId),
          tab === "active" ? hasUnsettledDebt : not(hasUnsettledDebt),
        ),
      )
      .orderBy(desc(expense.createdAt))
      .limit(PAGE_SIZE + 1)
      .offset(cursor);

    const hasMore = rows.length > PAGE_SIZE;
    const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

    return {
      items,
      nextCursor: hasMore ? cursor + PAGE_SIZE : null,
    };
  });

export const $getExpense = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { expenseId: string }) => input)
  .handler(async ({ context, data }) => {
    const { expenseId } = data;
    const activeGroupId = context.user.activeGroupId;

    if (!activeGroupId) {
      throw new Error("Expense not found");
    }

    const [expenseData] = await db
      .select({
        id: expense.id,
        name: expense.name,
        description: expense.description,
        amount: expense.amount,
        createdAt: expense.createdAt,
        payerName: user.name,
        payerId: expense.payerId,
      })
      .from(expense)
      .innerJoin(user, eq(user.id, expense.payerId))
      .where(and(eq(expense.id, expenseId), eq(expense.groupId, activeGroupId)))
      .limit(1);

    if (!expenseData) throw new Error("Expense not found");

    const debts = await db
      .select({
        id: expenseDebt.id,
        amount: expenseDebt.amount,
        settled: expenseDebt.settled,
        debtorId: expenseDebt.debtorId,
        debtorName: user.name,
      })
      .from(expenseDebt)
      .innerJoin(user, eq(user.id, expenseDebt.debtorId))
      .where(eq(expenseDebt.expenseId, expenseId));

    const logs = await db
      .select({
        id: expenseLog.id,
        amount: expenseLog.amount,
        createdAt: expenseLog.createdAt,
        debtorName: user.name,
        debtId: expenseLog.debtId,
      })
      .from(expenseLog)
      .innerJoin(expenseDebt, eq(expenseDebt.id, expenseLog.debtId))
      .innerJoin(user, eq(user.id, expenseDebt.debtorId))
      .where(eq(expenseDebt.expenseId, expenseId))
      .orderBy(desc(expenseLog.createdAt));

    return { expense: expenseData, debts, logs };
  });
