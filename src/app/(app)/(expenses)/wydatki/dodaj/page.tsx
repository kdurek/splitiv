import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/components/expense/expense-form';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ExpenseAddPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Dodaj wydatek">
      <ExpenseForm user={user} />
    </Section>
  );
}
