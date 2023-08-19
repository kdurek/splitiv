import { CreateGroupForm } from 'components/forms/create-group-form';
import { GroupSelect } from 'components/group-select';
import { Logo } from 'components/logo';
import { MobileNav } from 'components/mobile-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'components/ui/collapsible';
import { Separator } from 'components/ui/separator';
import { redirect } from 'next/navigation';
import { createTrpcCaller } from 'server/api/caller';
import { getServerAuthSession } from 'server/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  if (!session?.activeGroupId) {
    const caller = await createTrpcCaller();
    const groups = await caller.group.getAll();

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
      <header className="sticky top-0 z-40 border-b bg-background shadow-md md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Logo />
        </div>
      </header>
      <div className="flex-1 p-4">{children}</div>
      <div className="sticky bottom-0 z-40 border-t bg-background md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
