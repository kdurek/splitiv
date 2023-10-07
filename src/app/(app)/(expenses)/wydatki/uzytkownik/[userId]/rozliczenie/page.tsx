import { redirect } from 'next/navigation';

import { ExpensePaymentSettleForm } from '@/components/forms/expense-payment-settle-form';
import { Section } from '@/components/layout/section';
import { trpcServer } from '@/server/api/caller';
import { getServerAuthSession } from '@/server/auth';

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

  const paramUser = await trpcServer.user.getById({ userId: params.userId });
  const currentUser = await trpcServer.user.getById({
    userId: session.user.id,
  });

  if (!paramUser || !currentUser) {
    redirect('/');
  }

  const debts = await trpcServer.user.getPaymentSettle({
    userId: params.userId,
  });

  return (
    <Section title={paramUser.name}>
      <ExpensePaymentSettleForm paramUser={paramUser} currentUser={currentUser} debts={debts} />
    </Section>
  );
}
