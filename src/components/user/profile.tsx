'use client';

import { UserForm } from '@/components/user/user-form';
import { api } from '@/trpc/react';

export function Profile() {
  const [currentUser] = api.user.current.useSuspenseQuery();

  return (
    <div className="rounded-md border p-4">
      <UserForm user={currentUser} />
    </div>
  );
}
