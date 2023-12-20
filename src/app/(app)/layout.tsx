import { redirect } from 'next/navigation';

import { GroupSelect } from '@/app/(app)/(settings)/ustawienia/group-select';
import { CreateGroupForm } from '@/app/(app)/create-group-form';
import { GenderSelectForm } from '@/app/(app)/gender-select-form';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
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
    const groups = await api.group.getAll.query();

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
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 p-4">{children}</div>
      <div className="sticky bottom-0 z-40 bg-background shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <MobileNav />
      </div>
    </div>
  );
}
