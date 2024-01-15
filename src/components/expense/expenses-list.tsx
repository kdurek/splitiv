'use client';

import { ExpensesListCard, ExpensesListCardSkeleton, getExpenseStatus } from '@/components/expense/expenses-list-card';
import { ExpenseList } from '@/trpc/shared';

interface ExpenseListProps {
  expenses: ExpenseList;
}

export function ExpensesList({ expenses }: ExpenseListProps) {
  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <ExpensesListCard
          key={expense.id}
          id={expense.id}
          status={getExpenseStatus(expense)}
          name={expense.name}
          amount={Number(expense.amount)}
          date={expense.createdAt}
        />
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
