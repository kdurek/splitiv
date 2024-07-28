'use client';

import { ExpenseSettlementForm } from '@/components/expense/expense-settlement-form';
import { api } from '@/trpc/react';

interface ExpenseSettlementProps {
  paramsUserId: string;
}

export function ExpenseSettlement({ paramsUserId }: ExpenseSettlementProps) {
  const [paramsUser] = api.user.byId.useSuspenseQuery({ userId: paramsUserId });
  const [usersDebts] = api.expense.debt.getDebtsAndCreditsForCurrentUser.useSuspenseQuery({
    userId: paramsUserId,
  });

  return <ExpenseSettlementForm otherUser={paramsUser} currentUserDebtsAndCredits={usersDebts} />;
}
