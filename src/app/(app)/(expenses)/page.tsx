import { Section } from "components/section";
import { ExpenseList, UserBalance } from "features/expense";
import { createTrpcCaller } from "server/api/caller";

export default async function ExpensesPage() {
  const caller = await createTrpcCaller();
  const group = await caller.group.getById();

  return (
    <Section title="Wydatki">
      <div className="flex flex-col gap-4">
        <UserBalance group={group} />
        <ExpenseList />
      </div>
    </Section>
  );
}
