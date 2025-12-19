import type { User } from "@splitiv/db/prisma/generated/client";
import type Decimal from "decimal.js";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function BalanceCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <CardAction>
          <Skeleton className="h-9 w-24" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-0">
          <Item className="px-0 py-3">
            <ItemContent className="flex-row justify-between">
              <Skeleton className="h-[21px] w-24" />
              <Skeleton className="h-[21px] w-24" />
            </ItemContent>
          </Item>
          <ItemSeparator />
          <Item className="px-0 py-3">
            <ItemContent className="flex-row justify-between">
              <Skeleton className="h-[21px] w-24" />
              <Skeleton className="h-[21px] w-24" />
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export function BalanceCard({
  balance,
  action,
}: {
  balance?: { user: Pick<User, "name">; debts: Decimal; credits: Decimal };
  action?: React.ReactNode;
}) {
  if (!balance) {
    return <BalanceCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{balance.user.name}</CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-0">
          <Item className="px-0 py-3">
            <ItemContent className="flex-row justify-between">
              <ItemTitle>Twoje należności</ItemTitle>
              <ItemDescription>{balance.debts.toFixed(2)} zł</ItemDescription>
            </ItemContent>
          </Item>
          <ItemSeparator />
          <Item className="px-0 py-3">
            <ItemContent className="flex-row justify-between">
              <ItemTitle>Twoje zadłużenie</ItemTitle>
              <ItemDescription>{balance.credits.toFixed(2)} zł</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
