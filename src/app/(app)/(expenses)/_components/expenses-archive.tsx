'use client';

import React, { useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

import { ExpensesList, ExpensesListSkeleton } from '@/app/(app)/(expenses)/_components/expenses-list';
import { api } from '@/trpc/react';

export function ExpensesArchive() {
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const [data, { fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.getArchived.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (intersection?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [intersection?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const expenses = data?.pages.flatMap((page) => page.items);

  if (!expenses.length) {
    return <div className="rounded-md border p-4 text-center">Brak długów</div>;
  }

  return (
    <>
      <ExpensesList expenses={expenses} />
      <div ref={intersectionRef} />
    </>
  );
}

export function ExpensesArchiveSkeleton() {
  return <ExpensesListSkeleton count={10} />;
}