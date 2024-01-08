import { Archive } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FeedExpenses } from '@/app/(app)/(expenses)/feed-expenses';
import { UserStats } from '@/app/(app)/(expenses)/user-stats';
import { Section } from '@/components/layout/section';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ExpensesPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const infiniteExpense = await api.expense.listInfinite.query({
    limit: 10,
    isSettled: 'partially',
  });
  const group = await api.group.current.query();

  return (
    <Section title="Wydatki">
      <UserStats user={session.user} group={group} />
      <FeedExpenses infiniteExpensesInitialData={infiniteExpense} isSettled="partially" />
      <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
        <Archive className="mr-2 h-4 w-4" />
        Archiwum
      </Link>
    </Section>
  );
}
