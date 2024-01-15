import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { FeedExpenses, FeedExpensesSkeleton } from '@/app/(app)/(expenses)/feed-expenses';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';

export default async function ArchivePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <Suspense fallback={<FeedExpensesSkeleton />}>
        <FeedExpenses isSettled="fully" />
      </Suspense>
    </Section>
  );
}
