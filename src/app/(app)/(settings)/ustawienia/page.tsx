import { User2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/auth/logout-button';
import { GroupSelect } from '@/components/group/group-select';
import { Section } from '@/components/layout/section';
import { MembersList } from '@/components/settings/members-list';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { validateRequest } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function SettingsPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  const group = await api.group.current.query();

  return (
    <Section title="Ustawienia">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 rounded-md bg-white p-4">
          <Link href={'/ustawienia/profil'} className={cn(buttonVariants({ variant: 'outline' }))}>
            <User2 className="mr-2" /> Profil
          </Link>
          <LogoutButton />
        </div>

        <div className="space-y-2 rounded-md bg-white p-4">
          <Heading variant="h2">Aktywna grupa</Heading>
          <GroupSelect user={user} />
        </div>

        {user.id === group.adminId && (
          <div className="rounded-md bg-white p-4">
            <Heading variant="h2">Członkowie</Heading>
            <MembersList />
          </div>
        )}
      </div>
    </Section>
  );
}
