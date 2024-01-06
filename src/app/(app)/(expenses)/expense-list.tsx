'use client';

import { ExpenseCard, getExpenseStatus } from '@/app/(app)/(expenses)/expense-card';
import { GetAllExpenses } from '@/trpc/shared';

interface ExpenseListProps {
  expenses: GetAllExpenses;
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <ExpenseCard
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
