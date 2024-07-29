import { Suspense } from 'react';

import { ExpenseSearchInput } from '@/components/expense/expenses-search-input';
import { ExpensesSearchList } from '@/components/expense/expenses-search-list';
import { FullScreenLoading } from '@/components/layout/loading';

export default function ExpensesSearch() {
  return (
    <div className="space-y-4">
      <ExpenseSearchInput />
      <Suspense fallback={<FullScreenLoading />}>
        <ExpensesSearchList />
      </Suspense>
    </div>
  );
}
