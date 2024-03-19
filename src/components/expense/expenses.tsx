'use client';

import type { User } from 'lucia';
import { ArchiveIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesList } from '@/components/expense/expenses-list';
import { UserStats } from '@/components/expense/user-stats';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';

interface ExpensesProps {
  user: User;
}

export function Expenses({ user }: ExpensesProps) {
  const { ref, inView } = useInView({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } = api.expense.listActive.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const { data: group, status: groupStatus } = api.group.current.useQuery();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending' || groupStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (status === 'error' || groupStatus === 'error') {
    return <FullScreenError />;
  }

  const expenses = data.pages.flatMap((page) => page.items);

  return (
    <div className="space-y-4">
      <UserStats user={user} group={group} />
      <ExpensesList user={user} expenses={expenses} />
      <div ref={ref} />
      <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'ghost' }), 'w-full flex')}>
        <ArchiveIcon className="mr-2 size-4" />
        Archiwum
      </Link>
    </div>
  );
}
