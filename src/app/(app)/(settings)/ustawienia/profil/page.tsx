import { getTranslations } from 'next-intl/server';

import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { UserForm } from '@/components/user/user-form';
import { api, HydrateClient } from '@/trpc/server';

export default async function ProfilePage() {
  const t = await getTranslations('ProfilePage');

  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <UserForm />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
