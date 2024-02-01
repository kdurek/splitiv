import { redirect } from 'next/navigation';

import { Section } from '@/app/_components/layout/section';
import { ExpenseForm } from '@/app/(app)/(expenses)/_components/expense-form';
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
