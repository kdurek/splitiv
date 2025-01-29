import { notFound } from 'next/navigation';

import { ExpenseDetail } from '@/components/expense/expense-detail';
import { Section, SectionContent } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpensePageProps {
  params: Promise<{
    expenseId: string;
  }>;
}

export default async function ExpensePage({ params: paramsPromise }: ExpensePageProps) {
  const params = await paramsPromise;

  const expense = await api.expense.byId({ id: params.expenseId });
  if (!expense) {
    return notFound();
  }

  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionContent>
          <ExpenseDetail expense={expense} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
