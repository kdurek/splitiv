import Decimal from 'decimal.js';
import { redirect } from 'next/navigation';

import { ExpensesList } from '@/components/expense/expenses-list';
import { Section } from '@/components/layout/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect('/logowanie');
  }

  const user = await api.user.byId.query({ userId: params.userId });
  if (!user) {
    redirect('/');
  }

  const credits = await api.expense.between
    .query({
      payerId: session.user.id,
      debtorId: user.id,
    })
    .then((expenses) =>
      expenses.map((expense) => {
        const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === user.id);
        const expenseAmount =
          expenseDebt?.amount === expenseDebt?.settled
            ? expenseDebt?.amount
            : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
        return { ...expense, amount: expenseAmount ?? new Decimal(0) };
      }),
    );

  const debts = await api.expense.between
    .query({
      payerId: user.id,
      debtorId: session.user.id,
    })
    .then((expenses) =>
      expenses.map((expense) => {
        const expenseDebt = expense.debts.find((expenseDebt) => expenseDebt.debtorId === session.user.id);
        const expenseAmount =
          expenseDebt?.amount === expenseDebt?.settled
            ? expenseDebt?.amount
            : Decimal.sub(expenseDebt?.amount ?? 0, expenseDebt?.settled ?? 0);
        return { ...expense, amount: expenseAmount ?? new Decimal(0) };
      }),
    );

  return (
    <Section title="Szczegóły">
      <p className="text-muted-foreground">Pomiędzy Tobą, a {user.name}</p>
      <Tabs defaultValue="credits" className="mt-2">
        <TabsList>
          <TabsTrigger value="credits">Zapłaciłeś</TabsTrigger>
          <TabsTrigger value="debts">Pożyczyłeś</TabsTrigger>
        </TabsList>
        <TabsContent value="credits">
          <ExpensesList expenses={credits} session={session} />
        </TabsContent>
        <TabsContent value="debts">
          <ExpensesList expenses={debts} session={session} />
        </TabsContent>
      </Tabs>
    </Section>
  );
}
