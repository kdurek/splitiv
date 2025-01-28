import { getTranslations } from 'next-intl/server';

import { ExpenseForm } from '@/components/expense/expense-form';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  const t = await getTranslations('ExpenseEditPage');

  const expense = await api.expense.byId({ id: params.expenseId });
  if (!expense) return 'Nie znaleziono wydatku';

  void api.expense.byId.prefetch({ id: params.expenseId });
  void api.group.current.prefetch();
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ExpenseForm expense={expense} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
