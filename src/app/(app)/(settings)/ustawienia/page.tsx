import { User2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AddUserToGroupForm } from '@/app/(app)/(settings)/ustawienia/add-user-to-group-form';
import { GroupSelect } from '@/app/(app)/(settings)/ustawienia/group-select';
import { LogoutButton } from '@/app/(app)/(settings)/ustawienia/logout-button';
import { Section } from '@/components/layout/section';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const usersNotInCurrentGroup = await api.user.listNotInCurrentGroup.query();
  const groups = await api.group.list.query();
  const group = await api.group.current.query();

  return (
    <Section title="Ustawienia">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Link href={'/ustawienia/profil'} className={cn(buttonVariants({ variant: 'outline' }))}>
            <User2 className="mr-2" /> Profil
          </Link>
          <LogoutButton />
        </div>
        <Separator />
        <div className="space-y-2">
          <Heading variant="h2">Aktywna grupa</Heading>
          <GroupSelect activeGroupId={session.activeGroupId} groups={groups} />
        </div>
        {session.user.id === group.adminId && (
          <>
            <Separator />
            <div className="space-y-2">
              <Heading variant="h2">Członkowie</Heading>
              <ol className="space-y-1">
                {group.members.map((user) => (
                  <li key={user.id} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-black" /> {user.name}
                  </li>
                ))}
              </ol>
            </div>
            {!!usersNotInCurrentGroup.length && <AddUserToGroupForm users={usersNotInCurrentGroup} />}
          </>
        )}
      </div>
    </Section>
  );
}
