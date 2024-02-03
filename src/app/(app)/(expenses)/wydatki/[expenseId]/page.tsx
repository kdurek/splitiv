import { redirect } from 'next/navigation';

import { Section } from '@/app/_components/layout/section';
import { ExpenseDetail } from '@/app/(app)/(expenses)/_components/expense-detail';
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
