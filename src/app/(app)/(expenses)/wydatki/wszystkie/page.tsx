import { redirect } from 'next/navigation';

import { UserBalance } from '@/app/(app)/(expenses)/wydatki/wszystkie/user-balance';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ExpensesAllPage() {
  const group = await api.group.current.query();
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Wszystkie wydatki">
      <div className="flex flex-col gap-4">
        <UserBalance group={group} session={session} />
      </div>
    </Section>
  );
}
