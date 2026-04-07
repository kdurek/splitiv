import { defineRelationsPart } from "drizzle-orm";

import * as schema from "./";

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    pushSubscriptions: r.many.pushSubscription({
      from: r.user.id,
      to: r.pushSubscription.userId,
    }),
    groups: r.many.userGroup({
      from: r.user.id,
      to: r.userGroup.userId,
    }),
    expenses: r.many.expense({
      from: r.user.id,
      to: r.expense.payerId,
    }),
    debts: r.many.expenseDebt({
      from: r.user.id,
      to: r.expenseDebt.debtorId,
    }),
  },
  group: {
    members: r.many.userGroup({
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
    payer: r.one.user({
      from: r.expense.payerId,
      to: r.user.id,
    }),
    group: r.one.group({
      from: r.expense.groupId,
      to: r.group.id,
    }),
    debts: r.many.expenseDebt({
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
    logs: r.many.expenseLog({
      from: r.expenseDebt.id,
      to: r.expenseLog.debtId,
    }),
  },
  expenseLog: {
    debt: r.one.expenseDebt({
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
