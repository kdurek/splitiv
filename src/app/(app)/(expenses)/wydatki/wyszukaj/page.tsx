import { getTranslations } from 'next-intl/server';

import ExpensesSearch from '@/components/expense/expenses-search';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ExpenseSearchPage() {
  const t = await getTranslations('ExpenseSearchPage');

  void api.expense.listSearch.prefetchInfinite({
    limit: 10,
    searchText: '',
  });
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <ExpensesSearch />
    </Section>
  );
}
