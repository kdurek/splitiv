import { defineRelationsPart } from "drizzle-orm";

import * as schema from "./";

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    userGroups: r.many.userGroup({
      from: r.user.id,
      to: r.userGroup.userId,
    }),
    expenses: r.many.expense({
      from: r.user.id,
      to: r.expense.payerId,
    }),
    expenseDebts: r.many.expenseDebt({
      from: r.user.id,
      to: r.expenseDebt.debtorId,
    }),
    pushSubscriptions: r.many.pushSubscription({
      from: r.user.id,
      to: r.pushSubscription.userId,
    }),
  },
  group: {
    userGroups: r.many.userGroup({
      from: r.group.id,
      to: r.userGroup.groupId,
    }),
    expenses: r.many.expense({
      from: r.group.id,
      to: r.expense.groupId,
    }),
  },
  userGroup: {
    user: r.one.user({
      from: r.userGroup.userId,
      to: r.user.id,
    }),
    group: r.one.group({
      from: r.userGroup.groupId,
      to: r.group.id,
    }),
  },
  expense: {
    group: r.one.group({
      from: r.expense.groupId,
      to: r.group.id,
    }),
    payer: r.one.user({
      from: r.expense.payerId,
      to: r.user.id,
    }),
    expenseDebts: r.many.expenseDebt({
      from: r.expense.id,
      to: r.expenseDebt.expenseId,
    }),
  },
  expenseDebt: {
    expense: r.one.expense({
      from: r.expenseDebt.expenseId,
      to: r.expense.id,
    }),
    debtor: r.one.user({
      from: r.expenseDebt.debtorId,
      to: r.user.id,
    }),
    expenseLogs: r.many.expenseLog({
      from: r.expenseDebt.id,
      to: r.expenseLog.debtId,
    }),
  },
  expenseLog: {
    expenseDebt: r.one.expenseDebt({
      from: r.expenseLog.debtId,
      to: r.expenseDebt.id,
    }),
  },
  pushSubscription: {
    user: r.one.user({
      from: r.pushSubscription.userId,
      to: r.user.id,
    }),
  },
}));
