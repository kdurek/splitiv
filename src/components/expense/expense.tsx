'use client';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { api } from '@/trpc/react';

interface ExpenseProps {
  expenseId: string;
}

export function Expense({ expenseId }: ExpenseProps) {
  const [expense] = api.expense.byId.useSuspenseQuery({ id: expenseId });

  if (!expense) {
    return 'Nie znaleziono wydatku';
  }

  return (
    <div className="rounded-md bg-white p-4">
      <ExpenseDetail expense={expense} />
    </div>
  );
}
