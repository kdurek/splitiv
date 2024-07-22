import { ExpenseEdit } from '@/components/expense/expense-edit';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

interface ExpenseEditPageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpenseEditPage({ params }: ExpenseEditPageProps) {
  void api.expense.byId.prefetch({ id: params.expenseId });
  void api.group.current.prefetch();
  void api.user.current.prefetch();

  return (
    <Section title="Edytuj wydatek">
      <ExpenseEdit expenseId={params.expenseId} />
    </Section>
  );
}
