import { Expense } from '@/components/expense/expense';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

interface ExpensePageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  void api.expense.byId.prefetch({ id: params.expenseId });
  void api.user.current.prefetch();

  return (
    <Section>
      <Expense expenseId={params.expenseId} />
    </Section>
  );
}
