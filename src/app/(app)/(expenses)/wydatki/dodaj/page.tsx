import { redirect } from 'next/navigation';

import { ExpenseAdd } from '@/components/expense/expense-add';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ExpenseAddPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Dodaj wydatek">
      <ExpenseAdd user={user} />
    </Section>
  );
}
