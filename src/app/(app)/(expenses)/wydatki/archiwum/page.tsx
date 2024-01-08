import { redirect } from 'next/navigation';

import { FeedExpenses } from '@/app/(app)/(expenses)/feed-expenses';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ArchivePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const infiniteExpense = await api.expense.listInfinite.query({
    limit: 10,
    isSettled: 'fully',
  });

  return (
    <Section title="Archiwum">
      <FeedExpenses infiniteExpensesInitialData={infiniteExpense} isSettled="fully" />
    </Section>
  );
}
