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

  if (expenseStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (expenseStatus === 'error') {
    return <FullScreenError />;
  }

  if (!expense) {
    return 'Nie znaleziono wydatku';
  }

  return <ExpenseForm user={user} expense={expense} />;
}
