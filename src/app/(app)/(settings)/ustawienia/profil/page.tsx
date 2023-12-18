import { redirect } from 'next/navigation';

import { UserForm } from '@/app/(app)/(settings)/ustawienia/profil/user-form';
import { Section } from '@/components/layout/section';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const user = await api.user.getById.query({
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
