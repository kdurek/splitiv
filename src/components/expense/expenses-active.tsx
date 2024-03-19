'use client';

import type { User } from 'lucia';
import { ArchiveIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesListCard, ExpensesListCardSkeleton } from '@/components/expense/expenses-list-card';
import { FullScreenError } from '@/components/layout/error';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';

interface ExpensesActiveProps {
  user: User;
}

export function ExpensesActive({ user }: ExpensesActiveProps) {
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

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="overflow-hidden rounded-md">
        {Array.from({ length: 10 }).map((_, idx) => (
          <ExpensesListCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <FullScreenError />;
  }

  const expenses = data.pages.flatMap((page) => page.items);

  if (!expenses.length) {
    return <div className="rounded-md bg-white p-4 text-center">Brak długów</div>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-md">
        {expenses.map((expense) => (
          <ExpensesListCard key={expense.id} expense={expense} user={user} />
        ))}
      </div>
      <div ref={ref} />
      <Link href="/wydatki/archiwum" className={cn(buttonVariants({ variant: 'ghost' }), 'w-full flex')}>
        <ArchiveIcon className="mr-2 size-4" />
        Archiwum
      </Link>
    </>
  );
}
