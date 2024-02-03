import { Archive } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ExpensesDashboard, ExpensesDashboardSkeleton } from '@/components/expense/expenses-dashboard';
import { UserStats } from '@/components/expense/user-stats';
import { Section } from '@/components/layout/section';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getServerAuthSession } from '@/server/auth';

export default async function ExpensesPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  return (
    <Section title="Wydatki">
      <UserStats session={session} />
      <Suspense fallback={<ExpensesDashboardSkeleton />}>
        <ExpensesDashboard session={session} />
      </Suspense>
      <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
        <Archive className="mr-2 size-4" />
        Archiwum
      </Link>
    </Section>
  );
}
