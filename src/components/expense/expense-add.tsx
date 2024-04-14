'use client';

import type { User } from 'lucia';

import { ExpenseForm } from '@/components/expense/expense-form';
import { FullScreenError } from '@/components/layout/error';
import { FullScreenLoading } from '@/components/layout/loading';
import { api } from '@/trpc/react';

interface ExpenseAddProps {
  user: User;
}

export function ExpenseAdd({ user }: ExpenseAddProps) {
  const { data: group, status: groupStatus } = api.group.current.useQuery();

  if (groupStatus === 'pending') {
    return <FullScreenLoading />;
  }

  if (groupStatus === 'error') {
    return <FullScreenError />;
  }

  return (
    <div className="rounded-md bg-white p-4">
      <ExpenseForm user={user} group={group} />
    </div>
  );
}
