import { IconChevronRight } from "@tabler/icons-react";
import { redirect } from "next/navigation";

import { Section } from "components/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import { createTrpcCaller } from "server/api/caller";

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({
  params,
}: ExpenseDetailsPageProps) {
  const caller = await createTrpcCaller();
  const user = await caller.user.getById({ id: params.userId });

  if (!user) {
    redirect("/");
  }

  const debts = await caller.user.getDebts({ userId: params.userId });
  const credits = await caller.user.getCredits({ userId: params.userId });

  return (
    <Section title={user.name}>
      <Tabs defaultValue="debts">
        <TabsList>
          <TabsTrigger value="debts">Długi</TabsTrigger>
          <TabsTrigger value="credits">Pożyczki</TabsTrigger>
        </TabsList>
        <TabsContent value="debts">
          {debts.map((debt) => (
            <div className="p-4 border">
              <div className="line-clamp-1">{debt.expense.name}</div>
              <div className="grid grid-cols-5 place-items-center">
                <div className="text-sm text-muted-foreground">
                  {debt.debtor.name}
                </div>
                <IconChevronRight />
                <div className="text-sm text-muted-foreground">
                  {(Number(debt.amount) - Number(debt.settled)).toFixed(2)} zł
                </div>
                <IconChevronRight />
                <div className="text-sm text-muted-foreground">
                  {debt.expense.payer.name}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="credits">
          {credits.map((credit) => (
            <div className="p-4 border">
              <div className="line-clamp-1">{credit.expense.name}</div>
              <div className="grid grid-cols-5 place-items-center">
                <div className="text-sm text-muted-foreground">
                  {credit.debtor.name}
                </div>
                <IconChevronRight />
                <div className="text-sm text-muted-foreground">
                  {(Number(credit.amount) - Number(credit.settled)).toFixed(2)}
                  zł
                </div>
                <IconChevronRight />
                <div className="text-sm text-muted-foreground">
                  {credit.expense.payer.name}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Section>
  );
}