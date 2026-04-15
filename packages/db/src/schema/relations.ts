import { defineRelationsPart } from "drizzle-orm";

import * as schema from "./";

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    members: r.many.member({
      from: r.user.id,
      to: r.member.userId,
    }),
    invitations: r.many.invitation({
      from: r.user.id,
      to: r.invitation.inviterId,
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
  organization: {
    members: r.many.member({
      from: r.organization.id,
      to: r.member.organizationId,
    }),
    invitations: r.many.invitation({
      from: r.organization.id,
      to: r.invitation.organizationId,
    }),
    expenses: r.many.expense({
      from: r.organization.id,
      to: r.expense.groupId,
    }),
  },
  member: {
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
  },
  invitation: {
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.invitation.inviterId,
      to: r.user.id,
    }),
  },
  expense: {
    organization: r.one.organization({
      from: r.expense.groupId,
      to: r.organization.id,
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
