import Decimal from 'decimal.js';
import { redirect } from 'next/navigation';

import { ExpenseCard } from '@/app/(app)/(expenses)/expense-card';
import { Section } from '@/components/layout/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/server';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const user = await api.user.getById.query({ userId: params.userId });

  if (!user) {
    redirect('/');
  }

  const debts = await api.expense.getAll.query({
    payerId: params.userId,
  });
  const credits = await api.expense.getAll.query({
    debtorId: params.userId,
  });

  return (
    <Section title={user.name}>
      <Tabs defaultValue="debts">
        <TabsList>
          <TabsTrigger value="debts">Zapłata</TabsTrigger>
          <TabsTrigger value="credits">Pożyczka</TabsTrigger>
        </TabsList>
        <TabsContent value="debts">
          <div className="divide-y">
            {debts.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="credits">
          <div className="divide-y">
            {credits
              .filter((expense) => expense.payerId !== params.userId)
              .map((expense) => {
                const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === user.id);
                const expenseAmount =
                  expenseDebt?.amount === expenseDebt?.settled
                    ? expenseDebt?.amount
                    : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
                return (
                  <ExpenseCard
                    key={expense.id}
                    expense={{
                      ...expense,
                      amount: expenseAmount ?? new Decimal(0),
                    }}
                  />
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </Section>
  );
}
