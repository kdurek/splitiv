import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/app/(app)/(expenses)/expense-form';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const group = await api.group.getCurrent.query();
  const expense = await api.expense.getById.query({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section title="Edytuj wydatek">
      <ExpenseForm group={group} session={session} expense={expense} />
    </Section>
  );
}
