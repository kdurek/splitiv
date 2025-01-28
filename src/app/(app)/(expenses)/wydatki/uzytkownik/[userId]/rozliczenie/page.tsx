import { getTranslations } from 'next-intl/server';

import { ExpenseSettlementForm } from '@/components/expense/expense-settlement-form';
import { Section, SectionContent, SectionDescription, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpenseSettlementPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseSettlementPage({ params }: ExpenseSettlementPageProps) {
  const t = await getTranslations('ExpenseSettlementPage');

  const paramsUser = await api.user.byId({ id: params.userId });
  void api.expense.debt.getBetweenUser.prefetch({
    userId: params.userId,
  });

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
          <SectionDescription>{paramsUser.name}</SectionDescription>
        </SectionHeader>
        <SectionContent>
          <ExpenseSettlementForm paramsUserId={params.userId} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
