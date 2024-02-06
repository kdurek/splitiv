'use client';

import type { Session } from 'next-auth';

import { ExpensesListCard, ExpensesListCardSkeleton } from '@/components/expense/expenses-list-card';
import type { ExpensesList } from '@/trpc/shared';

interface ExpenseListProps {
  expenses: ExpensesList['items'];
  session: Session;
}

export function ExpensesList({ expenses, session }: ExpenseListProps) {
  return (
    <div className="overflow-hidden rounded-md">
      {expenses.map((expense) => (
        <ExpensesListCard key={expense.id} expense={expense} session={session} />
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
