import { redirect } from 'next/navigation';

import { FeedExpenses } from '@/app/(app)/(expenses)/feed-expenses';
import { FeedFilters } from '@/app/(app)/(expenses)/feed-filters';
import { FeedLegend } from '@/app/(app)/(expenses)/feed-legend';
import { UserStats } from '@/app/(app)/(expenses)/user-stats';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ExpensesPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const infiniteExpense = await api.expense.getInfinite.query({
    limit: 10,
  });
  const group = await api.group.getCurrent.query();

  return (
    <Section title="Wydatki">
      <div className="flex flex-col gap-4">
        <UserStats user={session.user} group={group} />
        <FeedLegend />
        <FeedFilters group={group} />
        <FeedExpenses infiniteExpensesInitialData={infiniteExpense} />
      </div>
    </Section>
  );
}
