'use client';

import type { User } from 'lucia';
import { User2 } from 'lucide-react';
import Link from 'next/link';

import { LogoutButton } from '@/components/auth/logout-button';
import { GroupSelect } from '@/components/group/group-select';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { MembersList } from '@/components/settings/members-list';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';

interface SettingsProps {
  user: User;
}

export function Settings({ user }: SettingsProps) {
  const { data: group, status: groupStatus } = api.group.current.useQuery();

  if (groupStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (groupStatus === 'error') {
    return <FullScreenError />;
  }

  return (
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
  );
}
