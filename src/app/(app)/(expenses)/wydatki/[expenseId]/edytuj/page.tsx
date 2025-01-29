import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ExpenseForm } from '@/app/(app)/(expenses)/wydatki/dodaj/form';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: Promise<{
    expenseId: string;
  }>;
}

export default async function ExpenseEditPage({ params: paramsPromise }: ExpenseEditPageProps) {
  const params = await paramsPromise;
  const t = await getTranslations('ExpenseEditPage');

  const expense = await api.expense.byId({ id: params.expenseId });
  if (!expense) {
    return notFound();
  }

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
