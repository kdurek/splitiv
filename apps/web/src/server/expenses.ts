import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, user } from "@repo/db/schema";
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
