import { ExpenseSearchInput } from '@/components/expense/expenses-search-input';
import { ExpensesSearchList } from '@/components/expense/expenses-search-list';

export default async function ExpensesSearch() {
  return (
    <div className="space-y-4">
      <ExpenseSearchInput />
      <ExpensesSearchList />
    </div>
  );
}
