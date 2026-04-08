import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";

export const $getDashboardBalance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user;
    const activeGroupId = currentUser.activeGroupId;

    if (!activeGroupId) {
      return { owedToYou: [], youOwe: [], totalOwedToYou: "0", totalYouOwe: "0", netBalance: "0" };
    }

    const owedToYouRows = await db
      .select({
        debtorId: expenseDebt.debtorId,
        debtorName: user.name,
        debtorImage: user.image,
        total: sql<string>`sum(${expenseDebt.amount} - ${expenseDebt.settled})`,
      })
      .from(expenseDebt)
      .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
      .innerJoin(user, eq(user.id, expenseDebt.debtorId))
      .where(
        and(
          eq(expense.groupId, activeGroupId),
          eq(expense.payerId, currentUser.id),
          sql`${expenseDebt.amount} - ${expenseDebt.settled} > 0`,
        ),
      )
      .groupBy(expenseDebt.debtorId, user.name, user.image);

    const youOweRows = await db
      .select({
        payerId: expense.payerId,
        payerName: user.name,
        payerImage: user.image,
        total: sql<string>`sum(${expenseDebt.amount} - ${expenseDebt.settled})`,
      })
      .from(expenseDebt)
      .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
      .innerJoin(user, eq(user.id, expense.payerId))
      .where(
        and(
          eq(expense.groupId, activeGroupId),
          eq(expenseDebt.debtorId, currentUser.id),
          sql`${expenseDebt.amount} - ${expenseDebt.settled} > 0`,
        ),
      )
      .groupBy(expense.payerId, user.name, user.image);

    const totalOwedToYou = owedToYouRows.reduce((sum, row) => sum + Number(row.total), 0);
    const totalYouOwe = youOweRows.reduce((sum, row) => sum + Number(row.total), 0);
    const netBalance = (totalOwedToYou - totalYouOwe).toFixed(2);

    return {
      owedToYou: owedToYouRows.map((row) => ({
        userId: row.debtorId,
        name: row.debtorName,
        image: row.debtorImage,
        amount: Number(row.total).toFixed(2),
      })),
      youOwe: youOweRows.map((row) => ({
        userId: row.payerId,
        name: row.payerName,
        image: row.payerImage,
        amount: Number(row.total).toFixed(2),
      })),
      totalOwedToYou: totalOwedToYou.toFixed(2),
      totalYouOwe: totalYouOwe.toFixed(2),
      netBalance,
    };
  });
