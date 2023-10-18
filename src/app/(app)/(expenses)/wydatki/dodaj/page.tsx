import { ExpenseForm } from '@/components/forms/expense/expense-form';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ExpenseAddPage() {
  const group = await api.group.getCurrent.query();

  return (
    <Section title="Dodaj wydatek">
      <ExpenseForm group={group} />
    </Section>
  );
}
