import { redirect } from 'next/navigation';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpensePageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const expense = await api.expense.byId.query({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section>
      <ExpenseDetail expense={expense} session={session} />
    </Section>
  );
}
