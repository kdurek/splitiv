'use client';

import type { User } from 'lucia';

import { ExpenseSettlementForm } from '@/components/expense/expense-settlement-form';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { api } from '@/trpc/react';

interface ExpenseSettlementProps {
  user: User;
  paramsUserId: string;
}

export function ExpenseSettlement({ user, paramsUserId }: ExpenseSettlementProps) {
  const { data: paramsUser, status: paramsUserStatus } = api.user.byId.useQuery({ userId: paramsUserId });
  const { data: usersDebts, status: usersDebtsStatus } = api.expense.debt.settlement.useQuery({
    userId: paramsUserId,
  });

  if (paramsUserStatus === 'pending' || usersDebtsStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (paramsUserStatus === 'error' || usersDebtsStatus === 'error') {
    return <FullScreenError />;
  }

  return <ExpenseSettlementForm paramsUser={paramsUser} currentUser={user} usersDebts={usersDebts} />;
}
