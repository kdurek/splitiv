import { createFileRoute, redirect } from "@tanstack/react-router";

import { dashboardBalanceQueryOptions } from "~/server/dashboard/queries";

export const Route = createFileRoute("/_auth/settle/")({
  beforeLoad: async ({ context }) => {
    const balance = await context.queryClient.ensureQueryData(dashboardBalanceQueryOptions());
    const firstPerson = balance.youOwe[0] ?? balance.owedToYou[0];
    if (firstPerson) {
      throw redirect({ to: "/settle/$userId", params: { userId: firstPerson.userId } });
    }
    throw redirect({ to: "/" });
  },
});
