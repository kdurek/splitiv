import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, expenseLog, member, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, exists, or, sql } from "drizzle-orm";
import { z } from "zod";

import { parseSearchQuery } from "../../lib/search";

export const $getDebtsToUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ targetUserId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const currentUser = context.user;
    const activeGroupId = context.session.activeOrganizationId;

    if (!activeGroupId) return [];

    return db
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
        and(
          eq(expenseDebt.debtorId, currentUser.id),
          eq(expense.payerId, data.targetUserId),
          eq(expense.groupId, activeGroupId),
          sql`${expenseDebt.amount} - ${expenseDebt.settled} > 0`,
        ),
      )
      .orderBy(desc(expense.createdAt));
  });

const PAGE_SIZE = 10;

export const $getExpenses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      cursor: z.number().int().min(0),
      q: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const currentUser = context.user;
    const { cursor, q } = data;
    const searchWords = parseSearchQuery(q);
    const groupId = context.session.activeOrganizationId;

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
        payerImage: user.image,
        myDebt: sql<string>`(${myDebt})`,
        isActive: sql<boolean>`(${hasUnsettledDebt})`,
      })
      .from(expense)
      .innerJoin(user, eq(user.id, expense.payerId))
      .where(
        and(
          eq(expense.groupId, groupId),
          ...searchWords.map((word) =>
            or(
              sql`lower(unaccent(${expense.name})) like '%' || lower(unaccent(${word})) || '%'`,
              sql`${expense.description} is not null and lower(unaccent(${expense.description})) like '%' || lower(unaccent(${word})) || '%'`,
            ),
          ),
        ),
      )
      .orderBy(desc(expense.createdAt))
      .limit(PAGE_SIZE + 1)
      .offset(cursor);

    const hasMore = rows.length > PAGE_SIZE;
    const items = (hasMore ? rows.slice(0, PAGE_SIZE) : rows).map((row) => ({
      ...row,
      isActive: Boolean(row.isActive),
    }));

    return {
      items,
      nextCursor: hasMore ? cursor + PAGE_SIZE : null,
    };
  });

export const $getExpense = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ expenseId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const activeGroupId = context.session.activeOrganizationId;

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
        payerImage: user.image,
        payerId: expense.payerId,
        groupId: expense.groupId,
      })
      .from(expense)
      .innerJoin(user, eq(user.id, expense.payerId))
      .where(and(eq(expense.id, data.expenseId), eq(expense.groupId, activeGroupId)))
      .limit(1);

    if (!expenseData) {
      throw new Error("Expense not found");
    }

    const [ownerMember] = await db
      .select({ userId: member.userId })
      .from(member)
      .where(and(eq(member.organizationId, expenseData.groupId), eq(member.role, "owner")))
      .limit(1);

    const debts = await db
      .select({
        id: expenseDebt.id,
        amount: expenseDebt.amount,
        settled: expenseDebt.settled,
        debtorId: expenseDebt.debtorId,
        debtorName: user.name,
        debtorImage: user.image,
      })
      .from(expenseDebt)
      .innerJoin(user, eq(user.id, expenseDebt.debtorId))
      .where(eq(expenseDebt.expenseId, data.expenseId));

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
      .where(eq(expenseDebt.expenseId, data.expenseId))
      .orderBy(desc(expenseLog.createdAt));

    return {
      expense: { ...expenseData, groupOwnerId: ownerMember?.userId ?? "" },
      debts,
      logs,
    };
  });
