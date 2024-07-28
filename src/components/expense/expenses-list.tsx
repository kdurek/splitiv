'use client';

import { ExpensesListCard } from '@/components/expense/expenses-list-card';
import type { ExpensesList } from '@/trpc/react';

interface ExpensesListProps {
  expenses: ExpensesList['items'];
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  if (!expenses.length) {
    return <div className="rounded-md bg-white p-4 text-center">Brak długów</div>;
  }

  return (
    <div className="divide-y divide-muted overflow-hidden rounded-md">
      {expenses.map((expense) => (
        <ExpensesListCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
