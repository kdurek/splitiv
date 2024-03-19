import { redirect } from 'next/navigation';

import { Archive } from '@/components/expense/archive';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ArchivePage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Archiwum">
      <Archive user={user} />
    </Section>
  );
}
