'use client';

import type { User } from 'lucia';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesList } from '@/components/expense/expenses-list';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { api } from '@/trpc/react';

interface ArchiveProps {
  user: User;
}

export function Archive({ user }: ArchiveProps) {
  const { ref, inView } = useInView({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } = api.expense.listArchive.useInfiniteQuery(
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
    return <FullScreenLoading />;
  }

  if (status === 'error') {
    return <FullScreenError />;
  }

  const expenses = data.pages.flatMap((page) => page.items);

  return (
    <>
      <ExpensesList user={user} expenses={expenses} />
      <div ref={ref} />
    </>
  );
}
