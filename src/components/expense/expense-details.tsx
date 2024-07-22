'use client';

import Decimal from 'decimal.js';

import { ExpensesListCard } from '@/components/expense/expenses-list-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';

interface ExpenseDetailsProps {
  paramsUserId: string;
}

export function ExpenseDetails({ paramsUserId }: ExpenseDetailsProps) {
  const [user] = api.user.current.useSuspenseQuery();
  const [paramsUser] = api.user.byId.useSuspenseQuery({ userId: paramsUserId });

  const [credits] = api.expense.between.useSuspenseQuery(
    {
      payerId: user?.id,
      debtorId: paramsUserId,
    },
    {
      select: (expenses) =>
        expenses.map((expense) => {
          const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === paramsUserId);
          const expenseAmount =
            expenseDebt?.amount === expenseDebt?.settled
              ? expenseDebt?.amount
              : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
          return { ...expense, amount: expenseAmount ?? new Decimal(0) };
        }),
    },
  );

  const [debts] = api.expense.between.useSuspenseQuery(
    {
      payerId: paramsUserId,
      debtorId: user?.id,
    },
    {
      select: (expenses) =>
        expenses.map((expense) => {
          const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === user?.id);
          const expenseAmount =
            expenseDebt?.amount === expenseDebt?.settled
              ? expenseDebt?.amount
              : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
          return { ...expense, amount: expenseAmount ?? new Decimal(0) };
        }),
    },
  );

  if (!paramsUser) {
    return 'Nie znaleziono użytkownika';
  }

  return (
    <div>
      <p className="text-muted-foreground">Pomiędzy Tobą, a {paramsUser.name}</p>
      <Tabs defaultValue="credits" className="mt-2">
        <TabsList>
          <TabsTrigger value="credits">Zapłaciłeś</TabsTrigger>
          <TabsTrigger value="debts">Pożyczyłeś</TabsTrigger>
        </TabsList>
        <TabsContent value="credits" className="overflow-hidden rounded-md">
          {credits.map((credit) => (
            <ExpensesListCard key={credit.id} expense={credit} />
          ))}
        </TabsContent>
        <TabsContent value="debts" className="overflow-hidden rounded-md">
          {debts.map((debt) => (
            <ExpensesListCard key={debt.id} expense={debt} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
