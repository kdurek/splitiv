'use client';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { ExpenseListItem } from '@/components/expense/expenses-list-item';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import type { ExpensesList, GroupGetBalances } from '@/trpc/react';

type ExpensesListProps =
  | {
      expenses: ExpensesList['items'];
      withDetails?: true;
    }
  | {
      expenses: GroupGetBalances[number]['credits'];
      withDetails?: false;
    };

export function ExpensesList({ expenses, withDetails }: ExpensesListProps) {
  if (!expenses.length) {
    return <div className="rounded-md p-4 text-center">Brak wydatków</div>;
  }

  if (!withDetails) {
    return (
      <div className="divide-y">
        {expenses.map((expense) => (
          <ExpenseListItem key={expense.id} expense={expense} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {expenses.map((expense) => (
        <Drawer key={expense.id}>
          <DrawerTrigger asChild>
            <button className="w-full outline-none">
              <ExpenseListItem expense={expense} />
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[96%]">
            <div className="overflow-auto overscroll-none p-4">
              <ExpenseDetail expense={expense} />
            </div>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
