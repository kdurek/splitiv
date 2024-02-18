import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/components/expense/expense-form';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  const expense = await api.expense.byId.query({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section title="Edytuj wydatek">
      <ExpenseForm user={user} expense={expense} />
    </Section>
  );
}
