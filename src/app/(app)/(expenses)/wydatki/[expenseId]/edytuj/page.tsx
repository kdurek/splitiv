import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/app/(app)/(expenses)/expense-form';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const group = await api.group.getCurrent.query();
  const expense = await api.expense.getById.query({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section title="Edytuj wydatek">
      <ExpenseForm group={group} expense={expense} />
    </Section>
  );
}
