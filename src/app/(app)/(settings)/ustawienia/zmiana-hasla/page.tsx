import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ChangePasswordPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  const t = await getTranslations('ChangePasswordPage');

  return (
    <Section title={t('title')}>
      <ChangePasswordForm userId={user.id} />
    </Section>
  );
}
