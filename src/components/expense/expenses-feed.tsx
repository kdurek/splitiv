'use client';

import type { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

import { ExpensesList, ExpensesListSkeleton } from '@/components/expense/expenses-list';
import { api } from '@/trpc/react';

interface ExpensesFeedProps {
  type: 'dashboard' | 'archived';
  session: Session;
}

export function ExpensesFeed({ type, session }: ExpensesFeedProps) {
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const [data, { fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.list.useSuspenseInfiniteQuery(
    {
      limit: 10,
      type,
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
    return <div className="rounded-md bg-white p-4 text-center">Brak długów</div>;
  }

  return (
    <>
      <ExpensesList expenses={expenses} session={session} />
      <div ref={intersectionRef} />
    </>
  );
}

export function ExpensesFeedSkeleton() {
  return <ExpensesListSkeleton count={10} />;
}
