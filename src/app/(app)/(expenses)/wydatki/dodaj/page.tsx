import { Section } from "components/section";
import { ExpenseForm } from "features/expense/components/expense-form/expense-form";
import { createTrpcCaller } from "server/api/caller";

export default async function ExpenseAddPage() {
  const caller = await createTrpcCaller();
  const group = await caller.group.getById();

  return (
    <Section title="Dodaj wydatek">
      <ExpenseForm group={group} />
    </Section>
  );
}
