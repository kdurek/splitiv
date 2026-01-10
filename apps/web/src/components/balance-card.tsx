import type { User } from "@splitiv/db/prisma/generated/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type Decimal from "decimal.js";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, queryClient } from "@/utils/orpc";

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
}: {
  balance: {
    user: Pick<User, "id" | "name">;
    debts: Decimal;
    credits: Decimal;
  };
}) {
  const currentUserQuery = useSuspenseQuery(
    orpc.auth.getCurrentUser.queryOptions()
  );

  const balanceQuery = useSuspenseQuery(
    orpc.expense.getBalanceBetweenUser.queryOptions({
      input: {
        userId: balance.user.id,
      },
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{balance.user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemGroup className="gap-0">
          <Item className="px-0 py-3">
            <ItemContent className="flex-row justify-between">
              <ItemTitle>Twoje należności</ItemTitle>
              <ItemDescription>
                <Link
                  search={{
                    payerIds: [currentUserQuery.data?.id ?? ""],
                    debtorIds: [balance.user.id],
                  }}
                  to="/expenses"
                >
                  {balance.debts.toFixed(2)} zł →
                </Link>
              </ItemDescription>
            </ItemContent>
          </Item>
          <ItemSeparator />
          <Item className="px-0 py-3">
            <ItemContent className="flex-row justify-between">
              <ItemTitle>Twoje zadłużenie</ItemTitle>
              <ItemDescription>
                <Link
                  search={{
                    payerIds: [balance.user.id],
                    debtorIds: [currentUserQuery.data?.id ?? ""],
                  }}
                  to="/expenses"
                >
                  {balance.credits.toFixed(2)} zł →
                </Link>
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
      <CardFooter>
        <SettleBetweenUserModal
          credits={balanceQuery.data?.credits}
          currentUserName={currentUserQuery.data?.name ?? ""}
          debts={balanceQuery.data?.debts}
          otherUserId={balanceQuery.data?.user.id ?? ""}
          otherUserName={balanceQuery.data?.user.name ?? ""}
        />
      </CardFooter>
    </Card>
  );
}

function getSettlementSummary(
  debts: Decimal | undefined,
  credits: Decimal | undefined,
  currentUserName: string,
  otherUserName: string
): React.ReactNode | null {
  if (!debts) {
    return null;
  }
  if (!credits) {
    return null;
  }

  const netAmount = credits.gt(debts)
    ? credits.minus(debts)
    : debts.minus(credits);

  if (netAmount.equals(0)) {
    return null;
  }

  const payerName = credits.gt(debts) ? currentUserName : otherUserName;
  const payeeName = credits.gt(debts) ? otherUserName : currentUserName;

  return (
    <>
      <span>{payerName.split(" ")[0]}</span> →{" "}
      <span className="font-medium text-foreground">
        {netAmount.toFixed(2)} zł
      </span>{" "}
      → {payeeName.split(" ")[0]}
    </>
  );
}

function SettleBetweenUserModal({
  credits,
  debts,
  currentUserName,
  otherUserName,
  otherUserId,
}: {
  credits: Decimal | undefined;
  debts: Decimal | undefined;
  currentUserName: string;
  otherUserName: string;
  otherUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const settlementSummary = getSettlementSummary(
    debts,
    credits,
    currentUserName,
    otherUserName
  );

  const settleBetweenUserMutation = useMutation(
    orpc.expense.debt.settleBetweenUser.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(
          orpc.expense.getExpensesBetweenUser.infiniteOptions({
            input: (cursor: string | null | undefined) => ({
              limit: 10,
              cursor,
              userId: otherUserId,
            }),
            initialPageParam: undefined,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
          })
        );
        queryClient.invalidateQueries(
          orpc.expense.getBalanceBetweenUser.queryOptions({
            input: {
              userId: otherUserId,
            },
          })
        );
        toast.success("Pomyślnie rozliczono długi");
        setOpen(false);
      },
      onError(error) {
        toast.error("Nie udało się rozliczyć długów", {
          description: error.message,
        });
      },
    })
  );

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button
          aria-label="Rozlicz"
          className="w-full"
          disabled={!settlementSummary}
          type="button"
          variant="outline"
        >
          Rozlicz
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Czy na pewno chcesz rozliczyć długi?</DrawerTitle>
          <DrawerDescription>{settlementSummary}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            disabled={settleBetweenUserMutation.isPending}
            onClick={() =>
              settleBetweenUserMutation.mutate({ userId: otherUserId })
            }
            type="button"
          >
            Potwierdź
          </Button>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Anuluj
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
