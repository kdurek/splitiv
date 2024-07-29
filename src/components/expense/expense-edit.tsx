'use client';

import { ExpenseForm } from '@/components/expense/expense-form';
import { api } from '@/trpc/react';

interface ExpenseEditProps {
  expenseId: string;
}

export function ExpenseEdit({ expenseId }: ExpenseEditProps) {
  const [expense] = api.expense.byId.useSuspenseQuery({ expenseId });

  if (!expense) {
    return 'Nie znaleziono wydatku';
  }

  return (
    <div className="rounded-md border p-4">
      <ExpenseForm expense={expense} />
    </div>
  );
}
