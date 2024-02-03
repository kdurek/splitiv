import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ExpensesArchive, ExpensesArchiveSkeleton } from '@/components/expense/expenses-archive';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';

export default async function ArchivePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <Suspense fallback={<ExpensesArchiveSkeleton />}>
        <ExpensesArchive session={session} />
      </Suspense>
    </Section>
  );
}
