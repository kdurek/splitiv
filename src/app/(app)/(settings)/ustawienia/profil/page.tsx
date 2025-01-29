import { getTranslations } from 'next-intl/server';

import { UserForm } from '@/app/(app)/(settings)/ustawienia/profil/form';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
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
