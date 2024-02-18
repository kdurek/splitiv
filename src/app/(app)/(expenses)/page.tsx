import { Archive } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { ExpensesFeed, ExpensesFeedSkeleton } from '@/components/expense/expenses-feed';
import { UserStats } from '@/components/expense/user-stats';
import { Section } from '@/components/layout/section';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateRequest } from '@/server/auth';

export default async function ExpensesPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section>
      <div className="space-y-4">
        <UserStats user={user} />
        <Suspense fallback={<ExpensesFeedSkeleton />}>
          <ExpensesFeed type="dashboard" user={user} />
        </Suspense>
        <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'ghost' }), 'w-full flex')}>
          <Archive className="mr-2 size-4" />
          Archiwum
        </Link>
      </div>
    </Section>
  );
}
