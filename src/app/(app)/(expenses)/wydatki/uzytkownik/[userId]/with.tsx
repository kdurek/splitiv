'use client';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { ExpensesList } from '@/components/expense/expenses-list';
import { ExpenseListItem } from '@/components/expense/expenses-list-item';
import { getUserRemainingAmount } from '@/lib/expense';
import { api } from '@/trpc/react';

interface ExpensesWithProps {
  userId: string;
}

export function ExpensesWith({ userId }: ExpensesWithProps) {
  const [user] = api.user.current.useSuspenseQuery();
  const [expenses] = api.expense.getExpensesBetweenUser.useSuspenseQuery({
    userId,
  });

  return (
    <div className="grid gap-4">
      <ExpensesList>
        {expenses.map((expense) => (
          <ExpenseListItem
            key={expense.id}
            name={expense.name}
            description={expense.description}
            payer={expense.payer}
            isPayer={expense.payerId === user?.id}
            debts={expense.debts}
            createdAt={expense.createdAt}
            fullAmount={expense.amount}
            toPayAmount={getUserRemainingAmount(expense, user.id, userId)}
          >
            <ExpenseDetail expense={expense} />
          </ExpenseListItem>
        ))}
      </ExpensesList>
    </div>
  );
}
