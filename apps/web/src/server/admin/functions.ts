import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, group, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const creditor = alias(user, "creditor");

export const $getAdminBalance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user;
    const activeGroupId = currentUser.activeGroupId;

    if (!activeGroupId) {
      return [];
    }

    const [activeGroup] = await db
      .select({ adminId: group.adminId })
      .from(group)
      .where(eq(group.id, activeGroupId))
      .limit(1);

    if (!activeGroup || activeGroup.adminId !== currentUser.id) {
      throw new Error("Forbidden");
    }

    const rows = await db
      .select({
        debtorId: expenseDebt.debtorId,
        debtorName: user.name,
        debtorImage: user.image,
        creditorId: expense.payerId,
        creditorName: creditor.name,
        creditorImage: creditor.image,
        total: sql<string>`sum(${expenseDebt.amount} - ${expenseDebt.settled})`,
      })
      .from(expenseDebt)
      .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
      .innerJoin(user, eq(user.id, expenseDebt.debtorId))
      .innerJoin(creditor, eq(creditor.id, expense.payerId))
      .where(
        and(
          eq(expense.groupId, activeGroupId),
          sql`${expenseDebt.amount} - ${expenseDebt.settled} > 0`,
          sql`${expenseDebt.debtorId} != ${expense.payerId}`,
        ),
      )
      .groupBy(
        expenseDebt.debtorId,
        user.name,
        user.image,
        expense.payerId,
        creditor.name,
        creditor.image,
      )
      .orderBy(sql`sum(${expenseDebt.amount} - ${expenseDebt.settled}) desc`);

    return rows.map((row) => ({
      debtorId: row.debtorId,
      debtorName: row.debtorName,
      debtorImage: row.debtorImage,
      creditorId: row.creditorId,
      creditorName: row.creditorName,
      creditorImage: row.creditorImage,
      amount: Number(row.total).toFixed(2),
    }));
  });
