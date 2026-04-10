import { Input } from "@repo/ui/components/input";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ReceiptIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { z } from "zod";

import { expensesInfiniteQueryOptions } from "~/server/expenses/queries";

export const Route = createFileRoute("/_auth/expenses/")({
  validateSearch: z.object({
    q: z.string().optional(),
    t: z.enum(["active", "archived"]).optional(),
  }),
  loader: ({ context }) =>
    context.queryClient.prefetchInfiniteQuery(expensesInfiniteQueryOptions("active")),
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
  const { q, t } = Route.useSearch();
  const navigate = useNavigate({ from: "/expenses/" });
  const tab: Tab = t ?? "active";
  const { ref, inView } = useInView();

  const [inputValue, setInputValue] = useState(q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = inputValue.trim();
      navigate({
        search: (prev) => ({ ...prev, q: trimmed.length >= 3 ? trimmed : undefined }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [inputValue, navigate]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery(
    expensesInfiniteQueryOptions(tab, q),
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-semibold tracking-tight">Wydatki</h1>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Szukaj wydatków..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pr-9 pl-9"
        />
        {inputValue && (
          <button
            onClick={() => setInputValue("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <div className="flex rounded-lg bg-muted p-1">
        {(["active", "archived"] satisfies Tab[]).map((t) => (
          <button
            key={t}
            onClick={() =>
              navigate({
                search: (prev) => ({ ...prev, t: t === "active" ? undefined : t }),
                replace: true,
              })
            }
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
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <ReceiptIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold">{item.name}</h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Zapłacił(a)
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
