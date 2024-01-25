import { redirect } from 'next/navigation';

import { Section } from '@/app/_components/layout/section';
import { ExpenseForm } from '@/app/(app)/(expenses)/_components/expense-form';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ExpenseAddPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const group = await api.group.current.query();

  return (
    <Section title="Dodaj wydatek">
      <ExpenseForm group={group} session={session} />
    </Section>
  );
}
