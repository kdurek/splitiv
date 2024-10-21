import { getTranslations } from 'next-intl/server';

import ExpensesSearch from '@/components/expense/expenses-search';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

export default async function ExpenseSearchPage() {
  const t = await getTranslations('ExpenseSearchPage');

  void api.expense.list.prefetchInfinite({
    limit: 10,
    type: 'search',
    searchText: '',
  });
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ExpensesSearch />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
