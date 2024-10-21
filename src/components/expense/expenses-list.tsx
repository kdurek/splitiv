'use client';

import { ExpenseListItem } from '@/components/expense/expenses-list-item';
import type { ExpensesList } from '@/trpc/react';

interface ExpensesListProps {
  expenses: ExpensesList['items'];
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  if (!expenses.length) {
    return <div className="rounded-md p-4 text-center">Brak wydatków</div>;
  }

  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <ExpenseListItem key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
