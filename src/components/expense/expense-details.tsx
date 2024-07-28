'use client';

import { ExpensesListCard } from '@/components/expense/expenses-list-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';

interface ExpenseDetailsProps {
  paramsUserId: string;
}

export function ExpenseDetails({ paramsUserId }: ExpenseDetailsProps) {
  const [otherUser] = api.user.byId.useSuspenseQuery({ userId: paramsUserId });

  const [{ credits, debts }] = api.expense.getExpensesBetweenUser.useSuspenseQuery({
    userId: paramsUserId,
  });

  if (!otherUser) {
    return 'Nie znaleziono użytkownika';
  }

  return (
    <div>
      <p className="text-muted-foreground">Pomiędzy Tobą, a {otherUser.name}</p>
      <Tabs defaultValue="credits" className="mt-2">
        <TabsList>
          <TabsTrigger value="credits">Zapłaciłeś</TabsTrigger>
          <TabsTrigger value="debts">Pożyczyłeś</TabsTrigger>
        </TabsList>
        <TabsContent value="credits" className="overflow-hidden rounded-md">
          {credits.map((credit) => (
            <ExpensesListCard key={credit.id} expense={credit} />
          ))}
        </TabsContent>
        <TabsContent value="debts" className="overflow-hidden rounded-md">
          {debts.map((debt) => (
            <ExpensesListCard key={debt.id} expense={debt} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
