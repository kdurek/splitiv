import { useSuspenseQuery } from "@tanstack/react-query";
import { BalanceCard, BalanceCardSkeleton } from "@/components/balance-card";
import { orpc } from "@/utils/orpc";

export function BalanceListSkeleton() {
  return (
    <div className="grid gap-4">
      <BalanceCardSkeleton />
      <BalanceCardSkeleton />
      <BalanceCardSkeleton />
      <BalanceCardSkeleton />
      <BalanceCardSkeleton />
    </div>
  );
}

export function BalanceList() {
  const balancesQuery = useSuspenseQuery(
    orpc.expense.getBalances.queryOptions()
  );

  return (
    <div className="grid gap-4">
      {balancesQuery.data.map((balance) => (
        <BalanceCard balance={balance} key={balance.user.id} />
      ))}
    </div>
  );
}
