'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpensesList } from '@/components/expense/expenses-list';
import { ExpenseListItem } from '@/components/expense/expenses-list-item';
import { api } from '@/trpc/react';

export function Expenses() {
  const { ref, inView } = useInView({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  const [, { data, fetchNextPage, isFetchingNextPage, hasNextPage }] = api.expense.list.useSuspenseInfiniteQuery(
    {
      limit: 10,
      type: 'active',
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
    <div className="space-y-4">
      <ExpensesList>
        {expenses.map((expense) => (
          <ExpenseListItem key={expense.id} expense={expense} />
        ))}
      </ExpensesList>
      <div ref={ref} />
    </div>
  );
}
