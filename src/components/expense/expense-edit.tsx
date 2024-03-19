'use client';

import type { User } from 'lucia';

import { ExpenseForm } from '@/components/expense/expense-form';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { api } from '@/trpc/react';

interface ExpenseEditProps {
  user: User;
  expenseId: string;
}

export function ExpenseEdit({ user, expenseId }: ExpenseEditProps) {
  const { data: expense, status: expenseStatus } = api.expense.byId.useQuery({ id: expenseId });
  const { data: group, status: groupStatus } = api.group.current.useQuery();

  if (expenseStatus === 'pending' || groupStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (expenseStatus === 'error' || groupStatus === 'error') {
    return <FullScreenError />;
  }

  if (!expense) {
    return 'Nie znaleziono wydatku';
  }

  return <ExpenseForm user={user} group={group} expense={expense} />;
}
