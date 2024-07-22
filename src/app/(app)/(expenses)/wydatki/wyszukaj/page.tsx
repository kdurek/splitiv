import ExpensesSearch from '@/components/expense/expenses-search';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ExpenseSearchPage() {
  void api.expense.listSearch.prefetchInfinite({
    limit: 10,
    searchText: '',
  });
  void api.user.current.prefetch();

  return (
    <Section title="Wyszukaj wydatek">
      <ExpensesSearch />
    </Section>
  );
}
