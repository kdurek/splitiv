'use client';

import { useIntersection } from '@mantine/hooks';
import { useEffect } from 'react';

import { ExpensesList, ExpensesListSkeleton } from '@/app/(app)/(expenses)/_components/expenses-list';
import { api } from '@/trpc/react';

export function ExpensesDashboard() {
  const { ref, entry } = useIntersection();

  const [data, { fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.getDashboard.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const expenses = data?.pages.flatMap((page) => page.items);

  if (!expenses.length) {
    return <div className="rounded-md border p-4 text-center">Brak długów</div>;
  }

  return (
    <>
      <ExpensesList expenses={expenses} />
      <div ref={ref} />
    </>
  );
}

export function ExpensesDashboardSkeleton() {
  return <ExpensesListSkeleton count={10} />;
}
