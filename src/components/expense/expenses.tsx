'use client';

import { ArchiveIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesList } from '@/components/expense/expenses-list';
import { NotificationPrompt } from '@/components/settings/notification-prompt';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';

export function Expenses() {
  const { ref, inView } = useInView({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const [, { data, fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.list.useSuspenseInfiniteQuery(
    {
      limit: 10,
      type: 'active',
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const expenses = data.pages.flatMap((page) => page.items);

  return (
    <div className="space-y-4">
      <NotificationPrompt />
      <ExpensesList withDetails expenses={expenses} />
      <div ref={ref} />
      <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'ghost' }), 'w-full flex')}>
        <ArchiveIcon className="mr-2 size-4" />
        Archiwum
      </Link>
    </div>
  );
}
