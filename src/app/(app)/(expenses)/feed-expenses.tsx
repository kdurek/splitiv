'use client';

import { useIntersection } from '@mantine/hooks';
import { useEffect } from 'react';

import { ExpenseList } from '@/app/(app)/(expenses)/expense-list';
import { useInfiniteExpenses } from '@/hooks/use-infinite-expenses';
import type { GetInfiniteExpenses } from '@/trpc/shared';

interface FeedExpensesProps {
  infiniteExpensesInitialData: GetInfiniteExpenses;
}

export function FeedExpenses({ infiniteExpensesInitialData }: FeedExpensesProps) {
  const { ref, entry } = useIntersection();

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useInfiniteExpenses({ infiniteExpensesInitialData });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoadingExpenses) return null;
  if (isErrorExpenses) return null;

  const expenses = data?.pages.flatMap((page) => page.items);

  if (!expenses.length) {
    return <div className="rounded-md border p-4 text-center">Brak długów</div>;
  }

  return (
    <>
      <ExpenseList expenses={expenses} />
      <div ref={ref} />
    </>
  );
}
