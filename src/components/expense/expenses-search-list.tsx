'use client';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesList } from '@/components/expense/expenses-list';
import { debouncedValueSearchTextAtom } from '@/lib/atoms';
import { api } from '@/trpc/react';

export function ExpensesSearchList() {
  const searchText = useAtomValue(debouncedValueSearchTextAtom);

  const { ref, inView } = useInView({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const [, { data, fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.list.useSuspenseInfiniteQuery(
    {
      limit: 10,
      type: 'search',
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

  const expenses = data.pages.flatMap((page) => page.items);

  return (
    <>
      <ExpensesList expenses={expenses} />
      <div ref={ref} />
    </>
  );
}
