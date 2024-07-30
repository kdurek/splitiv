import { getTranslations } from 'next-intl/server';

import { UsersBalances } from '@/components/expense/users-balances';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function DashboardPage() {
  const t = await getTranslations('DashboardPage');

  void api.group.getBalances.prefetch();
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <UsersBalances />
    </Section>
  );
}
