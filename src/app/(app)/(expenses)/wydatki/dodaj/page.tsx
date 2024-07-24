import { getTranslations } from 'next-intl/server';

import { ExpenseAdd } from '@/components/expense/expense-add';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ExpenseAddPage() {
  const t = await getTranslations('ExpenseAddPage');

  void api.user.current.prefetch();
  void api.group.current.prefetch();

  return (
    <Section title={t('title')}>
      <ExpenseAdd />
    </Section>
  );
}
