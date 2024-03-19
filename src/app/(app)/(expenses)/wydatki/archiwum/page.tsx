import { redirect } from 'next/navigation';

import { ExpensesArchive } from '@/components/expense/expenses-archive';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ArchivePage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <ExpensesArchive user={user} />
    </Section>
  );
}
