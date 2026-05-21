import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ExpenseDetail } from "~/expenses/components/expense-detail";
import { expenseQueryOptions } from "~/expenses/functions";

export const Route = createFileRoute("/_auth/expenses/$expenseId")({
  validateSearch: z.object({ n: z.string().optional() }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(expenseQueryOptions(params.expenseId)),
  component: function ExpenseDetailPage() {
    const { expenseId } = Route.useParams();
    const { n: notificationId } = Route.useSearch();
    return <ExpenseDetail expenseId={expenseId} notificationId={notificationId} />;
  },
});
