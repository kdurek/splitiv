import { getTranslations } from 'next-intl/server';

import { UsersBalances } from '@/components/expense/users-balances';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

export default async function DashboardPage() {
  const t = await getTranslations('DashboardPage');

  void api.group.getBalances.prefetch();
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <UsersBalances />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
