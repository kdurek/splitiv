'use client';

import type { User } from 'lucia';

import { ExpensesListCard, ExpensesListCardSkeleton } from '@/components/expense/expenses-list-card';
import type { ExpensesList } from '@/trpc/shared';

interface ExpenseListProps {
  expenses: ExpensesList['items'];
  user: User;
}

export function ExpensesList({ expenses, user }: ExpenseListProps) {
  return (
    <div className="overflow-hidden rounded-md">
      {expenses.map((expense) => (
        <ExpensesListCard key={expense.id} expense={expense} user={user} />
      ))}
    </div>
  );
}

export function ExpensesListSkeleton({ count = 10 }) {
  return (
    <div className="overflow-hidden rounded-md">
      {Array.from({ length: count }).map((_, idx) => (
        <ExpensesListCardSkeleton key={idx} />
      ))}
    </div>
  );
}
