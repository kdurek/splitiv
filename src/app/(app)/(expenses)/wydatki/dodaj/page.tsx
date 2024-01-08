import { redirect } from 'next/navigation';

import { ExpenseForm } from '@/app/(app)/(expenses)/expense-form';
import { Section } from '@/components/layout/section';
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
