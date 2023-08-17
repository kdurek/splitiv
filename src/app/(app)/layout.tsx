import { CreateGroupForm } from 'components/forms/create-group-form';
import { GroupSelectForm } from 'components/forms/group-select-form';
import { Logo } from 'components/logo';
import { MobileNav } from 'components/mobile-nav';
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
        <GroupSelectForm groups={groups} />
        <Separator />
        <CreateGroupForm />
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
