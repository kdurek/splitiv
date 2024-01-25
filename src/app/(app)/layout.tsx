import { redirect } from 'next/navigation';

import { MobileNav } from '@/app/_components/layout/mobile-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_components/ui/collapsible';
import { Separator } from '@/app/_components/ui/separator';
import { CreateGroupForm } from '@/app/(app)/(settings)/_components/create-group-form';
import { GenderSelectForm } from '@/app/(app)/(settings)/_components/gender-select-form';
import { GroupSelect } from '@/app/(app)/(settings)/_components/group-select';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  if (!session.user.gender) {
    return (
      <div className="p-4">
        <GenderSelectForm userId={session.user.id} />
      </div>
    );
  }

  if (!session?.activeGroupId) {
    const groups = await api.group.list.query();

    return (
      <div className="space-y-4 p-4">
        <GroupSelect groups={groups} />
        <Separator />
        <Collapsible>
          <CollapsibleTrigger className="w-full text-center text-muted-foreground">Stwórz grupę</CollapsibleTrigger>
          <CollapsibleContent>
            <CreateGroupForm />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-dvh pb-24">{children}</div>
      <div className="fixed bottom-0 z-40 h-20 w-full bg-background shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <MobileNav />
      </div>
    </div>
  );
}
