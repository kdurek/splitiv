import { User2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Section } from '@/app/_components/layout/section';
import { buttonVariants } from '@/app/_components/ui/button';
import { Heading } from '@/app/_components/ui/heading';
import { Separator } from '@/app/_components/ui/separator';
import { GroupSelect } from '@/app/(app)/(settings)/_components/group-select';
import { LogoutButton } from '@/app/(app)/(settings)/_components/logout-button';
import { MembersList } from '@/app/(app)/(settings)/ustawienia/members-list';
import { cn } from '@/lib/utils';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const group = await api.group.current.query();

  return (
    <Section title="Ustawienia">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link href={'/ustawienia/profil'} className={cn(buttonVariants({ variant: 'outline' }))}>
            <User2 className="mr-2" /> Profil
          </Link>
          <LogoutButton />
        </div>
        <Separator />
        <div className="space-y-2">
          <Heading variant="h2">Aktywna grupa</Heading>
          <GroupSelect session={session} />
        </div>
        {session.user.id === group.adminId && (
          <>
            <Separator />
            <Heading variant="h2">Członkowie</Heading>
            <MembersList />
          </>
        )}
      </div>
    </Section>
  );
}
