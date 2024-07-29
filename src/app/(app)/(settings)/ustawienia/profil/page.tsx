import { getTranslations } from 'next-intl/server';

import { Section } from '@/components/layout/section';
import { Profile } from '@/components/user/profile';
import { api } from '@/trpc/server';

export default async function ProfilePage() {
  const t = await getTranslations('ProfilePage');

  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <Profile />
    </Section>
  );
}
