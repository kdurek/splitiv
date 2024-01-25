import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Section } from '@/app/_components/layout/section';
import { ExpensesArchive, ExpensesArchiveSkeleton } from '@/app/(app)/(expenses)/_components/expenses-archive';
import { getServerAuthSession } from '@/server/auth';

export default async function ArchivePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <Suspense fallback={<ExpensesArchiveSkeleton />}>
        <ExpensesArchive />
      </Suspense>
    </Section>
  );
}
