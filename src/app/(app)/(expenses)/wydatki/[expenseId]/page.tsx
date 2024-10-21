import { Expense } from '@/components/expense/expense';
import { Section, SectionContent, SectionHeader } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpensePageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  void api.expense.byId.prefetch({ expenseId: params.expenseId });
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionContent>
          <Expense expenseId={params.expenseId} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
