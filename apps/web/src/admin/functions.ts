import { auth } from "@repo/auth/auth";
import { freshAuthMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const creditor = alias(user, "creditor");

export const $getAdminBalance = createServerFn({ method: "GET" })
  .middleware([freshAuthMiddleware])
  .handler(async ({ context }) => {
    const activeGroupId = context.session.activeOrganizationId;

    if (!activeGroupId) {
      return [];
    }

    const { success } = await auth.api.hasPermission({
      body: {
        permissions: { organization: ["update"] },
        organizationId: activeGroupId,
      },
      headers: getRequest().headers,
    });

    if (!success) {
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
