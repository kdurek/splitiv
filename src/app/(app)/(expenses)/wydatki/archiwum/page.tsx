import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ExpensesFeed, ExpensesFeedSkeleton } from '@/components/expense/expenses-feed';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';

export default async function ArchivePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <Suspense fallback={<ExpensesFeedSkeleton />}>
        <ExpensesFeed type="archived" session={session} />
      </Suspense>
    </Section>
  );
}
