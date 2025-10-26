import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
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
import { cn } from "@/lib/utils";
import type { Expense } from "../../../../packages/db/prisma/generated/client";

export function ExpenseCardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-0">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="grid gap-6">
        <ItemGroup>
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

export function ExpenseCard({
  expense,
}: {
  expense?: Pick<
    Expense,
    "id" | "name" | "description" | "amount" | "createdAt"
  >;
}) {
  if (!expense) {
    return <ExpenseCardSkeleton />;
  }

  return (
    <Link params={{ expenseId: expense.id }} to="/expenses/$expenseId">
      <Card>
        <CardHeader className={cn(!expense.description && "gap-0")}>
          <CardTitle>{expense.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {expense.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <ItemGroup>
            <Item className="px-0 py-3">
              <ItemContent className="flex-row justify-between">
                <ItemTitle>Kwota wydatku</ItemTitle>
                <ItemDescription>
                  {Number(expense.amount).toFixed(2)} zł
                </ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item className="px-0 py-3">
              <ItemContent className="flex-row justify-between">
                <ItemTitle>Data dodania</ItemTitle>
                <ItemDescription>
                  {format(expense.createdAt, "dd.MM.yyyy")}
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>
    </Link>
  );
}
