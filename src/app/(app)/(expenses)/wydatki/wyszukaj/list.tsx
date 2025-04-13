'use client';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { ExpensesList } from '@/components/expense/expenses-list';
import { ExpenseListItem } from '@/components/expense/expenses-list-item';
import { debouncedValueSearchTextAtom } from '@/lib/atoms';
import { getAllRemainingAmount } from '@/lib/expense';
import { api } from '@/trpc/react';

export function ExpensesSearchList() {
  const [user] = api.user.current.useSuspenseQuery();
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
      <ExpensesList>
        {expenses.map((expense) => (
          <ExpenseListItem
            key={expense.id}
            name={expense.name}
            description={expense.description}
            payer={expense.payer}
            isPayer={expense.payerId === user?.id}
            debts={expense.debts}
            createdAt={expense.createdAt}
            fullAmount={expense.amount}
            toPayAmount={getAllRemainingAmount(expense, user.id)}
          >
            <ExpenseDetail expense={expense} />
          </ExpenseListItem>
        ))}
      </ExpensesList>
      <div ref={ref} />
    </>
  );
}
