import { ExpenseFeed } from 'components/expense-feed';
import { ExpenseLegend } from 'components/expense-legend';
import { ExpenseListFilters } from 'components/filters';
import { Section } from 'components/section';
import { UserBalance } from 'components/user-balance';
import { createTrpcCaller } from 'server/api/caller';

export default async function ExpensesPage() {
  const caller = await createTrpcCaller();
  const infiniteExpense = await caller.expense.getInfinite({
    limit: 10,
  });
  const group = await caller.group.getCurrent();

  return (
    <Section title="Wydatki">
      <div className="flex flex-col gap-4">
        <UserBalance group={group} />
        <ExpenseLegend />
        <ExpenseListFilters group={group} />
        <ExpenseFeed infiniteExpensesInitialData={infiniteExpense} />
      </div>
    </Section>
  );
}
