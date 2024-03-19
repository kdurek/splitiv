import { redirect } from 'next/navigation';

import { ExpensesActive } from '@/components/expense/expenses-active';
import { UserStats } from '@/components/expense/user-stats';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

export default async function ExpensesPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section>
      <div className="space-y-4">
        <UserStats user={user} />
        <ExpensesActive user={user} />
      </div>
    </Section>
  );
}
