'use client';

import type { User } from 'lucia';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { api } from '@/trpc/react';

interface ExpenseProps {
  user: User;
  expenseId: string;
}

export function Expense({ user, expenseId }: ExpenseProps) {
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

  return (
    <div className="rounded-md bg-white p-4">
      <ExpenseDetail user={user} expense={expense} />
    </div>
  );
}
