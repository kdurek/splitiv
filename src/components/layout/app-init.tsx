'use client';

import type { User } from 'lucia';
import { useRouter } from 'next/navigation';

import { CreateGroupForm } from '@/components/group/create-group-form';
import { GroupSelect } from '@/components/group/group-select';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { GenderSelectForm } from '@/components/user/gender-select-form';
import type { GroupList } from '@/trpc/shared';

interface AppInitProps {
  children: React.ReactNode;
  user: User;
  groups: GroupList;
}

export function AppInit({ children, user, groups }: AppInitProps) {
  const router = useRouter();

  if (!user.gender) {
    return (
      <div className="p-4">
        <GenderSelectForm userId={user.id} />
      </div>
    );
  }

  if (!user.activeGroupId) {
    return (
      <div className="space-y-4 p-4">
        <GroupSelect
          user={user}
          groups={groups}
          onSuccess={() => {
            router.refresh();
          }}
        />
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
      <div className="min-h-dvh pb-20">{children}</div>
      <div className="fixed bottom-0 z-40 h-20 w-full rounded-t-md bg-background shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <MobileNav />
      </div>
    </div>
  );
}
