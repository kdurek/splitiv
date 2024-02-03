import { redirect } from 'next/navigation';

import { Section } from '@/components/layout/section';
import { UserForm } from '@/components/user/user-form';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const user = await api.user.byId.query({
    userId: session.user.id,
  });

  if (!user) {
    redirect('/');
  }

  return (
    <Section title="Profil">
      <UserForm user={user} />
    </Section>
  );
}
