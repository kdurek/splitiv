import { Archive } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { Section } from '@/app/_components/layout/section';
import { buttonVariants } from '@/app/_components/ui/button';
import { FeedExpenses, FeedExpensesSkeleton } from '@/app/(app)/(expenses)/_components/feed-expenses';
import { UserStats } from '@/app/(app)/(expenses)/_components/user-stats';
import { cn } from '@/lib/utils';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ExpensesPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const group = await api.group.current.query();

  return (
    <Section title="Wydatki">
      <UserStats user={session.user} group={group} />
      <Suspense fallback={<FeedExpensesSkeleton />}>
        <FeedExpenses isSettled="partially" />
      </Suspense>
      <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
        <Archive className="mr-2 size-4" />
        Archiwum
      </Link>
    </Section>
  );
}
