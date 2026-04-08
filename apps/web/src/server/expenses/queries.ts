import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { $getExpense, $getExpenses } from "./functions";

export const expensesInfiniteQueryOptions = (tab: "active" | "archived") =>
  infiniteQueryOptions({
    queryKey: ["expenses", tab],
    queryFn: ({ pageParam }) => $getExpenses({ data: { tab, cursor: pageParam } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const expenseQueryOptions = (expenseId: string) =>
  queryOptions({
    queryKey: ["expense", expenseId],
    queryFn: ({ signal }) => $getExpense({ data: { expenseId }, signal }),
  });
