"use client";

import { useIntersection } from "@mantine/hooks";
import { format } from "date-fns";
import { CircleDollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { DeleteExpenseModal } from "components/delete-expense-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { useInfiniteExpenses } from "hooks/use-infinite-expenses";

import { ExpensePayment } from "./expense-payment";

import type { GetExpensesByGroup, GetInfiniteExpenses } from "utils/api";

interface ExpenseCardProps {
  expense: GetExpensesByGroup[number];
}

export function ExpenseListItem({ expense }: ExpenseCardProps) {
  const { data: session } = useSession();
  const descriptionParts = expense.description?.split("\n");
  const hasDescription = descriptionParts?.length;
  const [payerFirstName] = expense.payer.name?.split(" ") ?? "";
  const formattedDate = format(expense.createdAt, "EEEEEE, d MMMM");

  const getSettledStateIcon = () => {
    const isPartiallySettled = expense.debts
      .filter((debt) => debt.debtorId !== expense.payerId)
      .some(
        (debt) =>
          (debt.settled !== debt.amount && Number(debt.settled) !== 0) ||
          debt.settled === debt.amount,
      );
    const isFullySettled = expense.debts.every(
      (debt) => debt.settled === debt.amount,
    );

    if (isFullySettled) {
      return (
        <div className="w-10 h-10 bg-teal-100 grid place-content-center rounded-md">
          <CircleDollarSign className="text-teal-500" />
        </div>
      );
    }

    if (isPartiallySettled) {
      return (
        <div className="w-10 h-10 bg-yellow-100 grid place-content-center rounded-md">
          <CircleDollarSign className="text-yellow-500" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 bg-blue-100 grid place-content-center rounded-md">
        <CircleDollarSign className="text-blue-500" />
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="p-2 w-full border rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center justify-between">
              {getSettledStateIcon()}
              <div className="text-start">
                <div className="line-clamp-1">{expense.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formattedDate}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {Number(expense.amount).toFixed(2)} zł
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense.name}</DialogTitle>
          {hasDescription && (
            <DialogDescription>
              {descriptionParts?.map((part, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={part + index}>{part}</span>
              ))}
            </DialogDescription>
          )}
        </DialogHeader>
        <div>{`${payerFirstName} - zapłacone ${Number(expense.amount).toFixed(
          2,
        )} zł`}</div>
        <div className="flex flex-col gap-2">
          {expense.debts.map((debt) => (
            <ExpensePayment key={debt.id} debt={debt} />
          ))}
        </div>

        {session?.user.id === expense.payerId && (
          <DialogFooter>
            <div className="text-end">
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
          expenses.map((expense) => (
            <ExpenseListItem key={expense.id} expense={expense} />
          ))
        ) : (
          <div className="p-4 border rounded-md">
            <div>Brak długów</div>
          </div>
        )}
      </div>
      <div ref={ref} />
    </>
  );
}
