import { getTranslations } from 'next-intl/server';

import { ExpenseSettlement } from '@/components/expense/expense-settlement';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

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
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ExpenseSettlement paramsUserId={params.userId} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
