import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ExpenseSearchInput } from '@/app/(app)/(expenses)/wydatki/wyszukaj/input';
import { ExpensesSearchList } from '@/app/(app)/(expenses)/wydatki/wyszukaj/list';
import { FullScreenLoading } from '@/components/layout/loading';
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
        <SectionContent className="grid gap-2">
          <ExpenseSearchInput />
          <Suspense fallback={<FullScreenLoading />}>
            <ExpensesSearchList />
          </Suspense>
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
