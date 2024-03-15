import { redirect } from 'next/navigation';

import { ExpenseEdit } from '@/components/expense/expense-edit';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

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

  return (
    <Section title="Edytuj wydatek">
      <ExpenseEdit user={user} expenseId={params.expenseId} />
    </Section>
  );
}
