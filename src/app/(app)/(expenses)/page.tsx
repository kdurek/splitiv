import { redirect } from 'next/navigation';

import { FeedExpenses } from '@/app/(app)/(expenses)/feed-expenses';
import { UserStats } from '@/app/(app)/(expenses)/user-stats';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ExpensesPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const infiniteExpense = await api.expense.listInfinite.query({
    limit: 10,
  });
  const group = await api.group.current.query();

  return (
    <>
      <UserStats user={session.user} group={group} />
      <FeedExpenses infiniteExpensesInitialData={infiniteExpense} />
    </>
  );
}
