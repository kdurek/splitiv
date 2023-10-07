import { ExpenseForm } from '@/components/forms/expense/expense-form';
import { Section } from '@/components/layout/section';
import { trpcServer } from '@/server/api/caller';

export default async function ExpenseAddPage() {
  const group = await trpcServer.group.getCurrent();

  return (
    <Section title="Dodaj wydatek">
      <ExpenseForm group={group} />
    </Section>
  );
}
