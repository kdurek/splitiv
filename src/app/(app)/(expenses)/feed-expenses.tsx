'use client';

import { useIntersection } from '@mantine/hooks';
import { useEffect } from 'react';

import { ExpensesList, ExpensesListSkeleton } from '@/components/expense/expenses-list';
import { useInfiniteExpenses } from '@/hooks/use-infinite-expenses';

interface FeedExpensesProps {
  isSettled?: 'fully' | 'partially';
}

export function FeedExpenses({ isSettled }: FeedExpensesProps) {
  const { ref, entry } = useIntersection();

  const [data, { fetchNextPage, isFetchingNextPage, hasNextPage }] = useInfiniteExpenses({
    isSettled,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
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

export function FeedExpensesSkeleton() {
  return <ExpensesListSkeleton count={10} />;
}
