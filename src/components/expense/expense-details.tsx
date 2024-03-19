'use client';

import Decimal from 'decimal.js';
import type { User } from 'lucia';

import { ExpensesListCard } from '@/components/expense/expenses-list-card';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';

interface ExpenseDetailsProps {
  user: User;
  paramsUserId: string;
}

export function ExpenseDetails({ user, paramsUserId }: ExpenseDetailsProps) {
  const { data: paramsUser, status: paramsUserStatus } = api.user.byId.useQuery({ userId: paramsUserId });

  const { data: credits, status: creditsStatus } = api.expense.between.useQuery(
    {
      payerId: user.id,
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

  const { data: debts, status: debtsStatus } = api.expense.between.useQuery(
    {
      payerId: paramsUserId,
      debtorId: user.id,
    },
    {
      select: (expenses) =>
        expenses.map((expense) => {
          const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === user.id);
          const expenseAmount =
            expenseDebt?.amount === expenseDebt?.settled
              ? expenseDebt?.amount
              : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
          return { ...expense, amount: expenseAmount ?? new Decimal(0) };
        }),
    },
  );

  if (paramsUserStatus === 'pending' || creditsStatus === 'pending' || debtsStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (paramsUserStatus === 'error' || creditsStatus === 'error' || debtsStatus === 'error') {
    return <FullScreenError />;
  }

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
            <ExpensesListCard key={credit.id} expense={credit} user={user} />
          ))}
        </TabsContent>
        <TabsContent value="debts" className="overflow-hidden rounded-md">
          {debts.map((debt) => (
            <ExpensesListCard key={debt.id} expense={debt} user={user} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
