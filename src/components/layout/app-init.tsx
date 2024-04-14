'use client';

import type { User } from 'lucia';
import { useRouter } from 'next/navigation';

import { CreateGroupForm } from '@/components/group/create-group-form';
import { GroupSelect } from '@/components/group/group-select';
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

  return children;
}
