'use client';

import { useRouter } from 'next/navigation';

import { CreateGroupForm } from '@/components/group/create-group-form';
import { GroupSelect } from '@/components/group/group-select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/lib/auth';

interface AppInitProps {
  children: React.ReactNode;
  user: User;
}

export function AppInit({ children, user }: AppInitProps) {
  const router = useRouter();

  if (!user.activeGroupId) {
    return (
      <div className="space-y-4 p-4">
        <GroupSelect
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
