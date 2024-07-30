import { getTranslations } from 'next-intl/server';

import { Expenses } from '@/components/expense/expenses';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ExpensesPage() {
  const t = await getTranslations('ExpensesPage');

  void api.expense.list.prefetchInfinite({
    limit: 10,
    type: 'active',
  });
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <Expenses />
    </Section>
  );
}
