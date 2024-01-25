import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Section } from '@/app/_components/layout/section';
import { FeedExpenses, FeedExpensesSkeleton } from '@/app/(app)/(expenses)/_components/feed-expenses';
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
