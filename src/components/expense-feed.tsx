'use client';

import { useIntersection } from '@mantine/hooks';
import { DeleteExpenseModal } from 'components/delete-expense-modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/ui/dialog';
import { format } from 'date-fns';
import { useInfiniteExpenses } from 'hooks/use-infinite-expenses';
import { cn } from 'lib/utils';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import type { GetInfiniteExpenses } from 'utils/api';

import { ExpensePayment } from './expense-payment';
import { buttonVariants } from './ui/button';

interface ExpenseCardProps {
  expense: GetInfiniteExpenses['items'][number];
}

export function ExpenseListItem({ expense }: ExpenseCardProps) {
  const { data: session } = useSession();
  const descriptionParts = expense.description?.split('\n');
  const hasDescription = descriptionParts?.length;
  const [payerFirstName] = expense.payer.name?.split(' ') ?? '';
  const formattedDate = format(expense.createdAt, 'EEEEEE, d MMMM');

  const getSettledStateIcon = () => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="w-full rounded-md border p-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4 overflow-hidden">
              <div>{getSettledStateIcon()}</div>
              <div className="overflow-hidden text-start">
                <div className="line-clamp-1">{expense.name}</div>
                <div className="text-sm text-muted-foreground">{formattedDate}</div>
              </div>
            </div>
            <div className="whitespace-nowrap text-sm text-muted-foreground">
              {Number(expense.amount).toFixed(2)} zł
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense.name}</DialogTitle>
          {hasDescription && (
            <DialogDescription className="text-start">
              {descriptionParts?.map((part, index) => (
                <span className="block" key={index}>
                  {part}
                </span>
              ))}
            </DialogDescription>
          )}
        </DialogHeader>
        <div>{`${payerFirstName} - zapłacone ${Number(expense.amount).toFixed(2)} zł`}</div>
        <div className="flex flex-col gap-2">
          {expense.debts.map((debt) => (
            <ExpensePayment key={debt.id} debt={debt} />
          ))}
        </div>

        {session?.user.id === expense.payerId && (
          <DialogFooter>
            <div className="flex items-center justify-end gap-4">
              <Link href={`/wydatki/${expense.id}/edytuj`} className={cn(buttonVariants({ variant: 'outline' }))}>
                Edytuj
              </Link>
              <DeleteExpenseModal expenseId={expense.id} />
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ExpenseListProps {
  infiniteExpensesInitialData: GetInfiniteExpenses;
}

export function ExpenseFeed({ infiniteExpensesInitialData }: ExpenseListProps) {
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
          expenses.map((expense) => <ExpenseListItem key={expense.id} expense={expense} />)
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
