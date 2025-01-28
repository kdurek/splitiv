import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';
import { HydrateClient } from '@/trpc/server';

export default async function ChangePasswordPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

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
