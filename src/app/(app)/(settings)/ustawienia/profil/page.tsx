import { UserForm } from 'components/forms/user-form';
import { Section } from 'components/section';
import { redirect } from 'next/navigation';
import { createTrpcCaller } from 'server/api/caller';
import { getServerAuthSession } from 'server/auth';

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const caller = await createTrpcCaller();
  const user = await caller.user.getById({
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
