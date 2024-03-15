import { redirect } from 'next/navigation';

import { ExpenseSettlement } from '@/components/expense/expense-settlement';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

interface ExpenseSettlementPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseSettlementPage({ params }: ExpenseSettlementPageProps) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Rozliczenie">
      <ExpenseSettlement user={user} paramsUserId={params.userId} />
    </Section>
  );
}
