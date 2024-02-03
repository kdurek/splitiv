'use client';

import type { Session } from 'next-auth';

import { ExpensesListCard, ExpensesListCardSkeleton } from '@/app/(app)/(expenses)/_components/expenses-list-card';
import type { ExpensesGetArchived, ExpensesGetDashboard } from '@/trpc/shared';

interface ExpenseListProps {
  expenses: ExpensesGetDashboard['items'] | ExpensesGetArchived['items'];
  session: Session;
}

export function ExpensesList({ expenses, session }: ExpenseListProps) {
  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <ExpensesListCard key={expense.id} expense={expense} session={session} />
      ))}
    </div>
  );
}

export function ExpensesListSkeleton({ count = 10 }) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, idx) => (
        <ExpensesListCardSkeleton key={idx} />
      ))}
    </div>
  );
}
