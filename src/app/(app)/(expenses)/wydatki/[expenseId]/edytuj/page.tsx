import { getTranslations } from 'next-intl/server';

import { ExpenseEdit } from '@/components/expense/expense-edit';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const t = await getTranslations('ExpenseEditPage');

  void api.expense.byId.prefetch({ expenseId: params.expenseId });
  void api.group.current.prefetch();
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ExpenseEdit expenseId={params.expenseId} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
