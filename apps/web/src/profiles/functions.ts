import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, expenseLog, member, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { openDebt } from "#/expenses/utils/money";

export const $getProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const currentUser = context.user;
    const activeGroupId = context.session.activeOrganizationId;

    if (!activeGroupId) throw new Error("Profile not found");

    const [targetMember] = await db
      .select({ userId: member.userId })
      .from(member)
      .where(and(eq(member.userId, data.userId), eq(member.organizationId, activeGroupId)))
      .limit(1);

    if (!targetMember) throw new Error("Profile not found");

    const [profileUser] = await db
      .select({ id: user.id, name: user.name, email: user.email, image: user.image })
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1);

    if (!profileUser) throw new Error("Profile not found");

    const isSelf = currentUser.id === data.userId;
    let balance: { owedToYou: string; youOwe: string; net: string } | null = null;

    if (!isSelf) {
      const [owedRow] = await db
        .select({
          total: sql<string>`coalesce(sum(${expenseDebt.amount} - ${expenseDebt.settled}), '0')`,
        })
        .from(expenseDebt)
        .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
        .where(
          and(
            eq(expense.groupId, activeGroupId),
            eq(expense.payerId, currentUser.id),
            eq(expenseDebt.debtorId, data.userId),
            openDebt,
          ),
        );

      const [oweRow] = await db
        .select({
          total: sql<string>`coalesce(sum(${expenseDebt.amount} - ${expenseDebt.settled}), '0')`,
        })
        .from(expenseDebt)
        .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
        .where(
          and(
            eq(expense.groupId, activeGroupId),
            eq(expense.payerId, data.userId),
            eq(expenseDebt.debtorId, currentUser.id),
            openDebt,
          ),
        );

      const owedToYouAmt = Number(owedRow?.total ?? 0);
      const youOweAmt = Number(oweRow?.total ?? 0);
      balance = {
        owedToYou: owedToYouAmt.toFixed(2),
        youOwe: youOweAmt.toFixed(2),
        net: (owedToYouAmt - youOweAmt).toFixed(2),
      };
    }

    const debts = await db
      .select({
        debtId: expenseDebt.id,
        amount: expenseDebt.amount,
        settled: expenseDebt.settled,
        expenseId: expense.id,
        expenseName: expense.name,
        expenseCreatedAt: expense.createdAt,
      })
      .from(expenseDebt)
      .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
      .where(
        and(eq(expenseDebt.debtorId, data.userId), eq(expense.groupId, activeGroupId), openDebt),
      )
      .orderBy(desc(expense.createdAt))
      .limit(3);

    const expenses = await db
      .select({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        createdAt: expense.createdAt,
      })
      .from(expense)
      .where(and(eq(expense.payerId, data.userId), eq(expense.groupId, activeGroupId)))
      .orderBy(desc(expense.createdAt))
      .limit(3);

    const payments = await db
      .select({
        id: expenseLog.id,
        amount: expenseLog.amount,
        createdAt: expenseLog.createdAt,
        expenseId: expense.id,
        expenseName: expense.name,
      })
      .from(expenseLog)
      .innerJoin(expenseDebt, eq(expenseDebt.id, expenseLog.debtId))
      .innerJoin(expense, eq(expense.id, expenseDebt.expenseId))
      .where(and(eq(expenseDebt.debtorId, data.userId), eq(expense.groupId, activeGroupId)))
      .orderBy(desc(expenseLog.createdAt))
      .limit(3);

    return { user: profileUser, balance, debts, expenses, payments };
  });
