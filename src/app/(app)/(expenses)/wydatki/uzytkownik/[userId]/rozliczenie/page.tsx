import { getTranslations } from 'next-intl/server';

import { ExpenseSettlement } from '@/components/expense/expense-settlement';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

interface ExpenseSettlementPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseSettlementPage({ params }: ExpenseSettlementPageProps) {
  const t = await getTranslations('ExpenseSettlementPage');

  void api.user.byId.prefetch({ userId: params.userId });
  void api.expense.debt.getDebtsAndCreditsForCurrentUser.prefetch({
    userId: params.userId,
  });
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <ExpenseSettlement paramsUserId={params.userId} />
    </Section>
  );
}
