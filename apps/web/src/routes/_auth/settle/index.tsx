import { createFileRoute, redirect } from "@tanstack/react-router";

import { dashboardBalanceQueryOptions } from "~/server/dashboard/queries";

export const Route = createFileRoute("/_auth/settle/")({
  beforeLoad: async ({ context }) => {
    const balance = await context.queryClient.ensureQueryData(dashboardBalanceQueryOptions());
    if (balance.youOwe.length > 0) {
      throw redirect({ to: "/settle/$userId", params: { userId: balance.youOwe[0].userId } });
    }
    throw redirect({ to: "/" });
  },
});
