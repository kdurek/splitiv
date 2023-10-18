import { redirect } from 'next/navigation';

import { FeedExpenses } from '@/components/feed/feed-expenses';
import { FeedFilters } from '@/components/feed/feed-filters';
import { FeedLegend } from '@/components/feed/feed-legend';
import { Section } from '@/components/layout/section';
import { UserStats } from '@/components/user/user-stats';
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
