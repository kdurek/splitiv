import { redirect } from 'next/navigation';

import { Section } from '@/app/_components/layout/section';
import { ExpenseForm } from '@/app/(app)/(expenses)/_components/expense-form';
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

  const group = await api.group.current.query();
  const expense = await api.expense.byId.query({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section title="Edytuj wydatek">
      <ExpenseForm group={group} session={session} expense={expense} />
    </Section>
  );
}
