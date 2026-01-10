import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ExpenseCard, ExpenseCardSkeleton } from "@/components/expense-card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export function ExpenseListSkeleton() {
  return (
    <div className="grid gap-4">
      <ExpenseCardSkeleton />
      <ExpenseCardSkeleton />
      <ExpenseCardSkeleton />
      <ExpenseCardSkeleton />
      <ExpenseCardSkeleton />
    </div>
  );
}

export function ExpenseList({
  status = "active",
  query = "",
  payerIds = [],
  debtorIds = [],
}: {
  status?: "active" | "archive";
  query?: string;
  payerIds?: string[];
  debtorIds?: string[];
}) {
  const { ref, inView } = useInView({ rootMargin: "200px", threshold: 0 });

  const expensesQuery = useSuspenseInfiniteQuery(
    orpc.expense.getAll.infiniteOptions({
      input: (cursor: string | null | undefined) => ({
        limit: 10,
        cursor,
        status,
        query,
        payerIds,
        debtorIds,
      }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  useEffect(() => {
    if (!expensesQuery.hasNextPage) {
      return;
    }
    if (expensesQuery.isFetchingNextPage) {
      return;
    }
    if (!inView) {
      return;
    }
    expensesQuery.fetchNextPage();
  }, [inView, expensesQuery]);

  return (
    <div className="grid gap-4">
      {expensesQuery.data.pages
        .flatMap((page) => page.items)
        .map((item) => (
          <ExpenseCard expense={item} key={item.id} />
        ))}
      {expensesQuery.hasNextPage ? (
        <div className={cn("flex items-center justify-center py-6")} ref={ref}>
          {expensesQuery.isFetchingNextPage ? (
            <Spinner className={cn("size-5 text-muted-foreground")} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
