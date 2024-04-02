'use client';

import { AddUserToGroupForm } from '@/components/group/add-user-to-group-form';
import type { GroupCurrent, UserListNotInCurrentGroup } from '@/trpc/shared';

interface MembersListProps {
  group: GroupCurrent;
  usersNotInCurrentGroup: UserListNotInCurrentGroup;
}

export function MembersList({ group, usersNotInCurrentGroup }: MembersListProps) {
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
