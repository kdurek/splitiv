import { getTranslations } from 'next-intl/server';

import { Expenses } from '@/components/expense/expenses';
import { Section } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

export default async function ExpensesPage() {
  const t = await getTranslations('ExpensesPage');

  void api.expense.listActive.prefetchInfinite({
    limit: 10,
  });
  void api.group.current.prefetch();
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <HydrateClient>
        <Expenses />
      </HydrateClient>
    </Section>
  );
}
