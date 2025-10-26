import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type Decimal from "decimal.js";
import { useState } from "react";
import { toast } from "sonner";
import { BalanceCard } from "@/components/balance-card";
import { ExpenseCard, ExpenseCardSkeleton } from "@/components/expense-card";
import { InfiniteList } from "@/components/infinite-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/_app/users/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const currentUserQuery = useQuery(orpc.auth.getCurrentUser.queryOptions());

  const expensesQuery = useInfiniteQuery(
    orpc.expense.getExpensesBetweenUser.infiniteOptions({
      input: (cursor: string | null | undefined) => ({
        limit: 10,
        cursor,
        userId,
      }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const balanceQuery = useQuery(
    orpc.expense.getBalanceBetweenUser.queryOptions({
      input: {
        userId,
      },
    })
  );

  return (
    <div className="grid gap-12">
      <BalanceCard
        action={
          <SettleBetweenUserModal
            credits={balanceQuery.data?.credits}
            currentUserName={currentUserQuery.data?.name ?? ""}
            debts={balanceQuery.data?.debts}
            otherUserId={balanceQuery.data?.user.id ?? ""}
            otherUserName={balanceQuery.data?.user.name ?? ""}
          />
        }
        balance={balanceQuery.data}
      />
      <InfiniteList
        className="grid gap-4"
        empty={<div>No expenses</div>}
        getKey={(expense) => expense.id}
        loading={<ExpenseCardSkeleton />}
        query={expensesQuery}
      >
        {(expense) => <ExpenseCard expense={expense} />}
      </InfiniteList>
    </div>
  );
}

function getSettlementSummary(
  debts: Decimal | undefined,
  credits: Decimal | undefined,
  currentUserName: string,
  otherUserName: string
): React.ReactNode | null {
  if (!debts) {
    return null;
  }
  if (!credits) {
    return null;
  }

  const netAmount = credits.gt(debts)
    ? credits.minus(debts)
    : debts.minus(credits);

  if (netAmount.equals(0)) {
    return null;
  }

  const payerName = credits.gt(debts) ? currentUserName : otherUserName;
  const payeeName = credits.gt(debts) ? otherUserName : currentUserName;

  return (
    <>
      <span>{payerName.split(" ")[0]}</span> →{" "}
      <span className="font-medium text-foreground">
        {netAmount.toFixed(2)} zł
      </span>{" "}
      → {payeeName.split(" ")[0]}
    </>
  );
}

function SettleBetweenUserModal({
  credits,
  debts,
  currentUserName,
  otherUserName,
  otherUserId,
}: {
  credits: Decimal | undefined;
  debts: Decimal | undefined;
  currentUserName: string;
  otherUserName: string;
  otherUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const settlementSummary = getSettlementSummary(
    debts,
    credits,
    currentUserName,
    otherUserName
  );

  const settleBetweenUserMutation = useMutation(
    orpc.expense.debt.settleBetweenUser.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          orpc.expense.getExpensesBetweenUser.infiniteOptions({
            input: (cursor: string | null | undefined) => ({
              limit: 10,
              cursor,
              userId: otherUserId,
            }),
            initialPageParam: undefined,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
          })
        );
        queryClient.invalidateQueries(
          orpc.expense.getBalanceBetweenUser.queryOptions({
            input: {
              userId: otherUserId,
            },
          })
        );
        toast.success("Pomyślnie rozliczono długi");
        setOpen(false);
      },
      onError(error) {
        toast.error("Nie udało się rozliczyć długów", {
          description: error.message,
        });
      },
    })
  );

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button
          aria-label="Rozlicz"
          disabled={!settlementSummary}
          type="button"
          variant="outline"
        >
          Rozlicz
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Czy na pewno chcesz rozliczyć długi?
          </AlertDialogTitle>
          <AlertDialogDescription>{settlementSummary}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Anuluj</AlertDialogCancel>
          <AlertDialogAction
            disabled={settleBetweenUserMutation.isPending}
            onClick={() =>
              settleBetweenUserMutation.mutate({ userId: otherUserId })
            }
            type="button"
          >
            Potwierdź
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
