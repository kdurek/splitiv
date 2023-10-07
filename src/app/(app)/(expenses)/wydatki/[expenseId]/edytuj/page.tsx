import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/components/forms/expense/expense-form';
import { Section } from '@/components/layout/section';
import { trpcServer } from '@/server/api/caller';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const group = await trpcServer.group.getCurrent();
  const expense = await trpcServer.expense.getById({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section title="Edytuj wydatek">
      <ExpenseForm group={group} expense={expense} />
    </Section>
  );
}
