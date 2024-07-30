'use client';

import { UsersBalances } from '@/components/expense/users-balances';

export function Dashboard() {
  return (
    <div className="space-y-4">
      <UsersBalances />
    </div>
  );
}
