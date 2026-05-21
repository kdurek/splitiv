import { createFileRoute } from "@tanstack/react-router";

import { AdminPanel } from "~/admin/components/admin-panel";
import { adminBalanceQueryOptions } from "~/admin/functions";

export const Route = createFileRoute("/_auth/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminBalanceQueryOptions()),
  component: AdminPanel,
});
