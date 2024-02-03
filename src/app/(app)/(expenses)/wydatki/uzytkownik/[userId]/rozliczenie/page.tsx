import { redirect } from 'next/navigation';

import { ExpenseSettlementForm } from '@/components/expense/expense-settlement-form';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect('/logowanie');
  }

  const paramUser = await api.user.byId.query({ userId: params.userId });
  const currentUser = await api.user.byId.query({
    userId: session.user.id,
  });

  if (!paramUser || !currentUser) {
    redirect('/');
  }

  const paramUserDebts = await api.expenseDebt.list.query({
    payerId: currentUser.id,
    debtorId: paramUser.id,
    isSettled: false,
  });
  const currentUserDebts = await api.expenseDebt.list.query({
    payerId: paramUser.id,
    debtorId: currentUser.id,
    isSettled: false,
  });

  if (!paramUserDebts.length && !currentUserDebts.length) {
    redirect('/');
  }

  return (
    <Section title="Rozliczenie">
      <ExpenseSettlementForm
        paramUser={paramUser}
        currentUser={currentUser}
        paramUserDebts={paramUserDebts}
        currentUserDebts={currentUserDebts}
      />
    </Section>
  );
}
