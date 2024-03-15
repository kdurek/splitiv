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
  const { data: paramUser, status: paramUserStatus } = api.user.byId.useQuery({ userId: paramsUserId });

  const { data: paramUserDebts, status: paramUserDebtsStatus } = api.expense.debt.list.useQuery({
    payerId: user.id,
    debtorId: paramsUserId,
    isSettled: false,
  });

  const { data: currentUserDebts, status: currentUserDebtsStatus } = api.expense.debt.list.useQuery({
    payerId: paramsUserId,
    debtorId: user.id,
    isSettled: false,
  });

  if (paramUserStatus === 'pending' || paramUserDebtsStatus === 'pending' || currentUserDebtsStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (paramUserStatus === 'error' || paramUserDebtsStatus === 'error' || currentUserDebtsStatus === 'error') {
    return <FullScreenError />;
  }

  return (
    <ExpenseSettlementForm
      paramUser={paramUser}
      currentUser={user}
      paramUserDebts={paramUserDebts}
      currentUserDebts={currentUserDebts}
    />
  );
}
