import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BalanceCard, BalanceCardSkeleton } from "@/components/balance-card";
import { List } from "@/components/list";
import { buttonVariants } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const balancesQuery = useQuery(orpc.expense.getBalances.queryOptions());

  return (
    <List
      className="grid gap-4"
      getKey={(balance) => balance.user.id}
      loading={<BalanceCardSkeleton />}
      query={balancesQuery}
    >
      {(balance) => (
        <BalanceCard
          action={
            <Link
              className={buttonVariants({ variant: "outline" })}
              params={{ userId: balance.user.id }}
              to="/users/$userId"
            >
              Wydatki
            </Link>
          }
          balance={balance}
        />
      )}
    </List>
  );
}
