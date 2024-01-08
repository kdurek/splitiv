'use client';

import { useIntersection } from '@mantine/hooks';
import { useEffect } from 'react';

import { ExpensesList } from '@/components/expense/expenses-list';
import { useInfiniteExpenses } from '@/hooks/use-infinite-expenses';
import type { ExpenseListInfinite } from '@/trpc/shared';

interface FeedExpensesProps {
  infiniteExpensesInitialData: ExpenseListInfinite;
  isSettled?: 'fully' | 'partially';
}

export function FeedExpenses({ infiniteExpensesInitialData, isSettled }: FeedExpensesProps) {
  const { ref, entry } = useIntersection();

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useInfiniteExpenses({ infiniteExpensesInitialData, isSettled });

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
      <ExpensesList expenses={expenses} />
      <div ref={ref} />
    </>
  );
}
