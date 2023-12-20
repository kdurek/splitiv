'use client';

import { useIntersection } from '@mantine/hooks';
import { format } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useInfiniteExpenses } from '@/hooks/use-infinite-expenses';
import { cn } from '@/lib/utils';
import type { GetInfiniteExpenses } from '@/trpc/shared';

interface FeedExpensesItemProps {
  expense: GetInfiniteExpenses['items'][number];
}

const getSettledStateIcon = (expense: GetInfiniteExpenses['items'][number]) => {
  const isPartiallySettled = expense.debts
    .filter((debt) => debt.debtorId !== expense.payerId)
    .some((debt) => (debt.settled !== debt.amount && Number(debt.settled) !== 0) || debt.settled === debt.amount);
  const isFullySettled = expense.debts.every((debt) => debt.settled === debt.amount);

  return (
    <div
      className={cn('grid h-10 w-10 place-content-center rounded-md', {
        'bg-teal-100': isFullySettled,
        'bg-yellow-100': isPartiallySettled,
        'bg-blue-100': !isPartiallySettled && !isFullySettled,
      })}
    >
      <CircleDollarSign
        className={cn({
          'text-teal-500': isFullySettled,
          'text-yellow-500': isPartiallySettled,
          'text-blue-500': !isPartiallySettled && !isFullySettled,
        })}
      />
    </div>
  );
};

export function FeedExpensesItem({ expense }: FeedExpensesItemProps) {
  const router = useRouter();

  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');

  function handleClick() {
    router.push(`/wydatki/${expense.id}`);
  }

  return (
    <button onClick={handleClick} className="w-full py-4">
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
    </button>
  );
}

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
      <div className="divide-y">
        {expenses.map((expense) => (
          <FeedExpensesItem key={expense.id} expense={expense} />
        ))}
      </div>
      <div ref={ref} />
    </>
  );
}
