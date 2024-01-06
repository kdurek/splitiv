'use client';

import { ExpensesListCard, getExpenseStatus } from '@/components/expense/expenses-list-card';
import { GetAllExpenses } from '@/trpc/shared';

interface ExpenseListProps {
  expenses: GetAllExpenses;
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
