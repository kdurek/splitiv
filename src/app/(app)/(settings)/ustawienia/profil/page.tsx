import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Section } from '@/components/layout/section';
import { UserForm } from '@/components/user/user-form';
import { validateRequest } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ProfilePage() {
  const t = await getTranslations('ProfilePage');

  const { user } = await validateRequest();

  const selectedUser = await api.user.byId({
    userId: user?.id,
  });
  if (!selectedUser) {
    redirect('/');
  }

  return (
    <Section title={t('title')}>
      <UserForm user={selectedUser} />
    </Section>
  );
}
