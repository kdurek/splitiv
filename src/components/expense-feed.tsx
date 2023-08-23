'use client';

import { useIntersection } from '@mantine/hooks';
import { format } from 'date-fns';
import { useInfiniteExpenses } from 'hooks/use-infinite-expenses';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import type { GetInfiniteExpenses } from 'utils/api';

interface ExpenseFeedItemProps {
  expense: GetInfiniteExpenses['items'][number];
}

const getSettledStateIcon = (expense: GetInfiniteExpenses['items'][number]) => {
  const isPartiallySettled = expense.debts
    .filter((debt) => debt.debtorId !== expense.payerId)
    .some((debt) => (debt.settled !== debt.amount && Number(debt.settled) !== 0) || debt.settled === debt.amount);
  const isFullySettled = expense.debts.every((debt) => debt.settled === debt.amount);

  if (isFullySettled) {
    return (
      <div className="grid h-10 w-10 place-content-center rounded-md bg-teal-100">
        <CircleDollarSign className="text-teal-500" />
      </div>
    );
  }

  if (isPartiallySettled) {
    return (
      <div className="grid h-10 w-10 place-content-center rounded-md bg-yellow-100">
        <CircleDollarSign className="text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="grid h-10 w-10 place-content-center rounded-md bg-blue-100">
      <CircleDollarSign className="text-blue-500" />
    </div>
  );
};

export function ExpenseFeedItem({ expense }: ExpenseFeedItemProps) {
  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');

  return (
    <Link href={`/wydatki/${expense.id}`} className="w-full rounded-md border p-2">
      <div className="flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <div>{getSettledStateIcon(expense)}</div>
          <div className="overflow-hidden text-start">
            <div className="line-clamp-1">{expense.name}</div>
            <div className="line-clamp-1 text-sm text-muted-foreground">{formattedDate}</div>
          </div>
        </div>
        <div className="whitespace-nowrap text-sm text-muted-foreground">{Number(expense.amount).toFixed(2)} zł</div>
      </div>
    </Link>
  );
}

interface ExpenseFeedProps {
  infiniteExpensesInitialData: GetInfiniteExpenses;
}

export function ExpenseFeed({ infiniteExpensesInitialData }: ExpenseFeedProps) {
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

  return (
    <>
      <div className="flex flex-col gap-2">
        {expenses.length ? (
          expenses.map((expense) => <ExpenseFeedItem key={expense.id} expense={expense} />)
        ) : (
          <div className="rounded-md border p-4">
            <div>Brak długów</div>
          </div>
        )}
      </div>
      <div ref={ref} />
    </>
  );
}
