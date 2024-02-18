import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ExpensesFeed, ExpensesFeedSkeleton } from '@/components/expense/expenses-feed';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ArchivePage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <Suspense fallback={<ExpensesFeedSkeleton />}>
        <ExpensesFeed type="archived" user={user} />
      </Suspense>
    </Section>
  );
}
