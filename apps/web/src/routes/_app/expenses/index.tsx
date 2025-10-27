import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";
import { ExpenseCard, ExpenseCardSkeleton } from "@/components/expense-card";
import { InfiniteList } from "@/components/infinite-list";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { pluralize } from "@/lib/pluralize";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/expenses/")({
  component: RouteComponent,
  validateSearch: z.object({
    query: z.string().optional(),
    status: z.enum(["active", "archive"]).optional(),
  }),
});

function RouteComponent() {
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.query ?? "");
  const [status, setStatus] = useState(search.status ?? "active");
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();

  const expensesQuery = useInfiniteQuery(
    orpc.expense.getAll.infiniteOptions({
      input: (cursor: string | null | undefined) => ({
        limit: 10,
        cursor,
        status,
        query: debouncedQuery,
      }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  useEffect(() => {
    navigate({
      to: "/expenses",
      search: {
        query: debouncedQuery ? debouncedQuery : undefined,
        status: status !== "active" ? status : undefined,
      },
    });
  }, [debouncedQuery, navigate, status]);

  const count = expensesQuery.data?.pages[0]?.count;

  return (
    <div className="grid gap-12">
      <div className="grid gap-2">
        <InputGroup>
          <InputGroupInput
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wyszukaj..."
            value={query}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {typeof count !== "undefined" ? (
              `${count} ${pluralize(count, "wynik", "wyniki", "wyników")}`
            ) : (
              <Skeleton className="h-5 w-24" />
            )}
          </InputGroupAddon>
        </InputGroup>

        <ButtonGroup className="w-full" orientation="horizontal">
          <Button
            className={cn(
              "flex-1",
              status === "active" &&
                "bg-accent text-accent-foreground dark:bg-input/50"
            )}
            onClick={() => status !== "active" && setStatus("active")}
            variant="outline"
          >
            Aktywne
          </Button>
          <Button
            className={cn(
              "flex-1",
              status === "archive" &&
                "bg-accent text-accent-foreground dark:bg-input/50"
            )}
            onClick={() => status !== "archive" && setStatus("archive")}
            variant="outline"
          >
            Archiwum
          </Button>
        </ButtonGroup>
      </div>

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
