import { FeedExpenses } from '@/components/feed/feed-expenses';
import { FeedFilters } from '@/components/feed/feed-filters';
import { FeedLegend } from '@/components/feed/feed-legend';
import { UserBalance } from '@/components/group/user-balance';
import { Section } from '@/components/layout/section';
import { trpcServer } from '@/server/api/caller';

export default async function ExpensesPage() {
  const infiniteExpense = await trpcServer.expense.getInfinite({
    limit: 10,
  });
  const group = await trpcServer.group.getCurrent();

  return (
    <Section title="Wydatki">
      <div className="flex flex-col gap-4">
        <UserBalance group={group} />
        <FeedLegend />
        <FeedFilters group={group} />
        <FeedExpenses infiniteExpensesInitialData={infiniteExpense} />
      </div>
    </Section>
  );
}
