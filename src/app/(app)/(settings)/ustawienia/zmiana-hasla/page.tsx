import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/app/(app)/(settings)/ustawienia/zmiana-hasla/form';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { HydrateClient } from '@/trpc/server';

export default async function ChangePasswordPage() {
  const t = await getTranslations('ChangePasswordPage');

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <ChangePasswordForm />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
