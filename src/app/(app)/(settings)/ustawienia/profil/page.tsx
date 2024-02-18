import { redirect } from 'next/navigation';

import { Section } from '@/components/layout/section';
import { UserForm } from '@/components/user/user-form';
import { validateRequest } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ProfilePage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect('/logowanie');
  }

  const selectedUser = await api.user.byId.query({
    userId: user.id,
  });
  if (!selectedUser) {
    redirect('/');
  }

  return (
    <Section title="Profil">
      <UserForm user={selectedUser} />
    </Section>
  );
}
