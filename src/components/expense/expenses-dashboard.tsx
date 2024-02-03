'use client';

import type { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

import { ExpensesList, ExpensesListSkeleton } from '@/components/expense/expenses-list';
import { api } from '@/trpc/react';

interface ExpensesDashboardProps {
  session: Session;
}

export function ExpensesDashboard({ session }: ExpensesDashboardProps) {
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const [data, { fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.getDashboard.useSuspenseInfiniteQuery(
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
      <ExpensesList expenses={expenses} session={session} />
      <div ref={intersectionRef} />
    </>
  );
}

export function ExpensesDashboardSkeleton() {
  return <ExpensesListSkeleton count={10} />;
}
