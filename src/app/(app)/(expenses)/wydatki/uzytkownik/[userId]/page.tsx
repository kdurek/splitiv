import Decimal from 'decimal.js';
import { redirect } from 'next/navigation';

import { ExpensesList } from '@/components/expense/expenses-list';
import { Section } from '@/components/layout/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/server';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const user = await api.user.byId.query({ userId: params.userId });

  if (!user) {
    redirect('/');
  }

  const debts = await api.expense.list.query({
    payerId: user.id,
  });

  const credits = await api.expense.list
    .query({
      debtorId: user.id,
    })
    .then((credits) =>
      credits
        .filter((expense) => expense.payerId !== user.id)
        .map((expense) => {
          const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === user.id);
          const expenseAmount =
            expenseDebt?.amount === expenseDebt?.settled
              ? expenseDebt?.amount
              : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
          return { ...expense, amount: expenseAmount ?? new Decimal(0) };
        }),
    );

  return (
    <Section title={user.name}>
      <Tabs defaultValue="debts">
        <TabsList>
          <TabsTrigger value="debts">Zapłata</TabsTrigger>
          <TabsTrigger value="credits">Pożyczka</TabsTrigger>
        </TabsList>
        <TabsContent value="debts">
          <ExpensesList expenses={debts} />
        </TabsContent>
        <TabsContent value="credits">
          <ExpensesList expenses={credits} />
        </TabsContent>
      </Tabs>
    </Section>
  );
}
