import { getTranslations } from 'next-intl/server';

import { ExpenseAdd } from '@/components/expense/expense-add';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

export default async function ExpenseAddPage() {
  const t = await getTranslations('ExpenseAddPage');

  void api.user.current.prefetch();
  void api.group.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ExpenseAdd />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
