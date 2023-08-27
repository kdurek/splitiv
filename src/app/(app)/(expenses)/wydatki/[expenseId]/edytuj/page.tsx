import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/components/forms/expense/expense-form';
import { Section } from '@/components/layout/section';
import { createTrpcCaller } from '@/server/api/caller';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const caller = await createTrpcCaller();
  const group = await caller.group.getCurrent();
  const expense = await caller.expense.getById({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  return (
    <Section title="Edytuj wydatek">
      <ExpenseForm group={group} expense={expense} />
    </Section>
  );
}
