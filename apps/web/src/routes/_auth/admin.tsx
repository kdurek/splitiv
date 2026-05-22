import { createFileRoute } from "@tanstack/react-router";

import { AdminPanel } from "#/admin/pages/admin-panel";
import { adminBalanceQueryOptions } from "#/admin/queries";

export const Route = createFileRoute("/_auth/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminBalanceQueryOptions()),
  component: AdminPanel,
});
