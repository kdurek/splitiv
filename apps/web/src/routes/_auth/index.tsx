import { createFileRoute } from "@tanstack/react-router";

import { DashboardHome } from "~/dashboard/pages/dashboard-home";
import { dashboardBalanceQueryOptions } from "~/dashboard/queries";

export const Route = createFileRoute("/_auth/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardBalanceQueryOptions()),
  component: DashboardHome,
});
