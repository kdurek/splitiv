import { redirect } from 'next/navigation';

import { Expenses } from '@/components/expense/expenses';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ExpensesPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Wydatki">
      <Expenses user={user} />
    </Section>
  );
}
