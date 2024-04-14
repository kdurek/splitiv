'use client';

import { useAtomValue } from 'jotai';
import type { User } from 'lucia';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesList } from '@/components/expense/expenses-list';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { debouncedValueSearchTextAtom } from '@/lib/atoms';
import { api } from '@/trpc/react';

interface ExpensesSearchListProps {
  user: User;
}

export function ExpensesSearchList({ user }: ExpensesSearchListProps) {
  const searchText = useAtomValue(debouncedValueSearchTextAtom);

  const { ref, inView } = useInView({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } = api.expense.listSearch.useInfiniteQuery(
    {
      limit: 10,
      searchText,
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
