import { createFileRoute } from "@tanstack/react-router";

import { dashboardBalanceQueryOptions } from "~/dashboard/functions";
import { SettleUser } from "~/expenses/components/settle-user";
import { debtsFromUserQueryOptions, debtsToUserQueryOptions } from "~/expenses/functions";

export const Route = createFileRoute("/_auth/settle/$userId")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(dashboardBalanceQueryOptions()),
      context.queryClient.ensureQueryData(debtsToUserQueryOptions(params.userId)),
      context.queryClient.ensureQueryData(debtsFromUserQueryOptions(params.userId)),
    ]),
  component: function SettlePage() {
    const { userId } = Route.useParams();
    return <SettleUser userId={userId} />;
  },
});
