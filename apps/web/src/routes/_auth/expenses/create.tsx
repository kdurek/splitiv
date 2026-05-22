import { createFileRoute } from "@tanstack/react-router";

import { ExpenseCreateWizard } from "#/expenses/pages/expense-create-wizard";
import { groupsQueryOptions } from "#/groups/queries";

export const Route = createFileRoute("/_auth/expenses/create")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: ExpenseCreateWizard,
});
