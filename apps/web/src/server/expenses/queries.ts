import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { $getDebtsToUser, $getExpense, $getExpenses } from "./functions";

export const expensesInfiniteQueryOptions = (q?: string) =>
  infiniteQueryOptions({
    queryKey: ["expenses", q ?? ""],
    queryFn: ({ pageParam }) => $getExpenses({ data: { cursor: pageParam, q } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const expenseQueryOptions = (expenseId: string) =>
  queryOptions({
    queryKey: ["expense", expenseId],
    queryFn: ({ signal }) => $getExpense({ data: { expenseId }, signal }),
  });

export const debtsToUserQueryOptions = (targetUserId: string) =>
  queryOptions({
    queryKey: ["debts-to-user", targetUserId],
    queryFn: ({ signal }) => $getDebtsToUser({ data: { targetUserId }, signal }),
  });
