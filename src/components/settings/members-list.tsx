'use client';

import { AddUserToGroupForm } from '@/components/group/add-user-to-group-form';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { api } from '@/trpc/react';

export function MembersList() {
  const { data: group, status: groupStatus } = api.group.current.useQuery();
  const { data: usersNotInCurrentGroup, status: usersNotInCurrentGroupStatus } =
    api.user.listNotInCurrentGroup.useQuery();

  if (groupStatus === 'pending' || usersNotInCurrentGroupStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (groupStatus === 'error' || usersNotInCurrentGroupStatus === 'error') {
    return <FullScreenError />;
  }

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
