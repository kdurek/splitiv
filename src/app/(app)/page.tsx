import { getTranslations } from 'next-intl/server';

import { Dashboard } from '@/components/dashboard/dashboard';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function DashboardPage() {
  const t = await getTranslations('DashboardPage');

  void api.group.getBalances.prefetch();
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <Dashboard />
    </Section>
  );
}
