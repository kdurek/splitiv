import { redirect } from 'next/navigation';

import { Expense } from '@/components/expense/expense';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

interface ExpensePageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section>
      <Expense user={user} expenseId={params.expenseId} />
    </Section>
  );
}
