'use client';

import { ExpensesList } from '@/components/expense/expenses-list';
import { ExpenseListItem } from '@/components/expense/expenses-list-item';
import { api } from '@/trpc/react';

interface ExpensesWithProps {
  userId: string;
}

export function ExpensesWith({ userId }: ExpensesWithProps) {
  const [expenses] = api.expense.getExpensesBetweenUser.useSuspenseQuery({
    userId,
  });

  return (
    <div className="space-y-4">
      <ExpensesList>
        {expenses.map((expense) => (
          <ExpenseListItem key={expense.id} expense={expense} />
        ))}
      </ExpensesList>
    </div>
  );
}
