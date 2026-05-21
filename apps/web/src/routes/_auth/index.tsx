import { createFileRoute } from "@tanstack/react-router";

import { DashboardHome } from "~/dashboard/components/dashboard-home";
import { dashboardBalanceQueryOptions } from "~/dashboard/functions";

export const Route = createFileRoute("/_auth/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardBalanceQueryOptions()),
  component: DashboardHome,
});
