'use client';

import { User2 } from 'lucide-react';
import Link from 'next/link';

import { LogoutButton } from '@/components/auth/logout-button';
import { GroupSelect } from '@/components/group/group-select';
import { LocaleSelect } from '@/components/settings/locale-select';
import { MembersList } from '@/components/settings/members-list';
import { Notification } from '@/components/settings/notification';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';

export function Settings() {
  const [user] = api.user.current.useSuspenseQuery();
  const [group] = api.group.current.useSuspenseQuery();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Link href={'/ustawienia/profil'} className={cn(buttonVariants({ variant: 'outline' }))}>
          <User2 className="mr-2" /> Profil
        </Link>
        <LogoutButton />
      </div>

      <div className="space-y-2 rounded-md border p-4">
        <Heading variant="h2">Aktywna grupa</Heading>
        <GroupSelect />
      </div>

      <div className="space-y-2 rounded-md border p-4">
        <Heading variant="h2">Język</Heading>
        <LocaleSelect />
      </div>

      {user?.id === group.adminId && (
        <div className="space-y-2 rounded-md border p-4">
          <Heading variant="h2">Członkowie</Heading>
          <MembersList />
        </div>
      )}

      {user?.id === group.adminId && (
        <div className="rounded-md border p-4">
          <Notification />
        </div>
      )}
    </div>
  );
}
