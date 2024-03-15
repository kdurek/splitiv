import { redirect } from 'next/navigation';

import { ExpenseDetails } from '@/components/expense/expense-details';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Szczegóły">
      <ExpenseDetails user={user} paramsUserId={params.userId} />
    </Section>
  );
}
