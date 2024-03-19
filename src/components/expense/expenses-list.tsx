'use client';

import type { User } from 'lucia';

import { ExpensesListCard } from '@/components/expense/expenses-list-card';
import type { ExpensesListActive, ExpensesListArchive } from '@/trpc/shared';

interface ExpensesListProps {
  user: User;
  expenses: ExpensesListActive['items'] | ExpensesListArchive['items'];
}

export function ExpensesList({ user, expenses }: ExpensesListProps) {
  if (!expenses.length) {
    return <div className="rounded-md bg-white p-4 text-center">Brak długów</div>;
  }

  return (
    <div className="overflow-hidden rounded-md">
      {expenses.map((expense) => (
        <ExpensesListCard key={expense.id} expense={expense} user={user} />
      ))}
    </div>
  );
}
