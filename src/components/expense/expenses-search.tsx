import type { User } from 'lucia';

import { ExpenseSearchInput } from '@/components/expense/expenses-search-input';
import { ExpensesSearchList } from '@/components/expense/expenses-search-list';

interface ExpensesSearchProps {
  user: User;
}

export default async function ExpensesSearch({ user }: ExpensesSearchProps) {
  return (
    <div className="space-y-4">
      <ExpenseSearchInput />
      <ExpensesSearchList user={user} />
    </div>
  );
}
