import { redirect } from 'next/navigation';

import { ExpensePaymentSettleForm } from '@/components/forms/expense-payment-settle-form';
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

  const paramUser = await api.user.getById.query({ userId: params.userId });
  const currentUser = await api.user.getById.query({
    userId: session.user.id,
  });

  if (!paramUser || !currentUser) {
    redirect('/');
  }

  const debts = await api.user.getPaymentSettle.query({
    userId: params.userId,
  });

  return (
    <Section title={paramUser.name}>
      <ExpensePaymentSettleForm paramUser={paramUser} currentUser={currentUser} debts={debts} />
    </Section>
  );
}
