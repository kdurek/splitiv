'use client';

import { AddUserToGroupForm } from '@/app/(app)/(settings)/_components/add-user-to-group-form';
import { api } from '@/trpc/react';

export function MembersList() {
  const [group] = api.group.current.useSuspenseQuery();
  const [usersNotInCurrentGroup] = api.user.listNotInCurrentGroup.useSuspenseQuery();

  return (
    <div className="space-y-4">
      <ol className="space-y-1">
        {group.members.map((user) => (
          <li key={user.id} className="flex items-center gap-2">
            <div className="size-1 rounded-full bg-black" /> {user.name}
          </li>
        ))}
      </ol>
      <AddUserToGroupForm users={usersNotInCurrentGroup} />
    </div>
  );
}
