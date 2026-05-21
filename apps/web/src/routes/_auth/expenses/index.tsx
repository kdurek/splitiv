import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ExpensesList } from "~/expenses/components/expenses-list";
import { expensesInfiniteQueryOptions } from "~/expenses/functions";

export const Route = createFileRoute("/_auth/expenses/")({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  loader: ({ context }) =>
    context.queryClient.prefetchInfiniteQuery(expensesInfiniteQueryOptions()),
  component: function ExpensesIndexPage() {
    const { q } = Route.useSearch();
    return <ExpensesList initialQ={q} />;
  },
});
