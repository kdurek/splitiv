import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/components/expense/expense-form';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';

export default async function ExpenseAddPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Dodaj wydatek">
      <ExpenseForm session={session} />
    </Section>
  );
}
