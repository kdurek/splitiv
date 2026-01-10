import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { BalanceList, BalanceListSkeleton } from "@/components/balance-list";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={<BalanceListSkeleton />}>
      <BalanceList />
    </Suspense>
  );
}
