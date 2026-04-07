import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { $getExpenses } from "~/server/expenses";

export const Route = createFileRoute("/_auth/expenses/")({
  component: ExpensesIndex,
});

type Tab = "active" | "archived";

type ExpenseItem = {
  id: string;
  name: string;
  amount: string;
  payerName: string;
  myDebt: string;
};

function formatAmount(amount: string) {
  return `${Number(amount).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function ExpensesIndex() {
  const [tab, setTab] = useState<Tab>("active");
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["expenses", tab],
    queryFn: ({ pageParam }) => $getExpenses({ data: { tab, cursor: pageParam } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-semibold tracking-tight">Wydatki</h1>

      <div className="flex rounded-lg bg-muted p-1">
        {(["active", "archived"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-xs font-bold tracking-wider uppercase transition-all ${
              tab === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "active" ? "Aktywne" : "Archiwalne"}
          </button>
        ))}
      </div>

      <div className="space-y-6 pt-2 pb-4">
        {status === "pending" && (
          <p className="py-8 text-center text-sm text-muted-foreground">Ładowanie...</p>
        )}
        {status === "success" && items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Brak wydatków.</p>
        )}
        {items.map((item) => (
          <ExpenseRow key={item.id} item={item} isArchived={tab === "archived"} />
        ))}
        {isFetchingNextPage && (
          <p className="py-4 text-center text-sm text-muted-foreground">Ładowanie...</p>
        )}
        <div ref={ref} />
      </div>
    </div>
  );
}

function ExpenseRow({ item, isArchived }: { item: ExpenseItem; isArchived: boolean }) {
  return (
    <Link
      to="/expenses/$expenseId"
      params={{ expenseId: item.id }}
      className={`flex items-start justify-between ${isArchived ? "opacity-60" : ""}`}
    >
      <div className="flex gap-4">
        <div className="space-y-1">
          <h4 className="font-semibold">{item.name}</h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              ZAPŁACONE PRZEZ
            </span>
            <span className="text-xs font-medium">{item.payerName}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold tracking-tight">{formatAmount(item.amount)}</p>
        {isArchived ? (
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            ROZLICZONE
          </p>
        ) : Number(item.myDebt) > 0 ? (
          <p className="text-[10px] font-bold tracking-widest text-primary uppercase">
            DŁUG {formatAmount(item.myDebt)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
