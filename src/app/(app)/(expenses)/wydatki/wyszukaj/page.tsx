import { redirect } from 'next/navigation';

import ExpensesSearch from '@/components/expense/expenses-search';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ExpenseSearchPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Wyszukaj wydatek">
      <ExpensesSearch user={user} />
    </Section>
  );
}
