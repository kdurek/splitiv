import { useAtomValue } from 'jotai';

import { expenseFilterDebtorIdAtom, expenseFilterPayerIdAtom, expenseFilterSearchTextAtom } from '@/lib/atoms';
import { api } from '@/trpc/react';
import type { ExpenseListInfinite } from '@/trpc/shared';

interface UseInfiniteExpensesProps {
  infiniteExpensesInitialData: ExpenseListInfinite;
  isSettled?: 'fully' | 'partially';
}

export function useInfiniteExpenses({ infiniteExpensesInitialData, isSettled }: UseInfiniteExpensesProps) {
  const searchText = useAtomValue(expenseFilterSearchTextAtom);
  const payerId = useAtomValue(expenseFilterPayerIdAtom);
  const debtorId = useAtomValue(expenseFilterDebtorIdAtom);

  return api.expense.listInfinite.useInfiniteQuery(
    {
      limit: 10,
      name: searchText,
      description: searchText,
      payerId,
      debtorId,
      isSettled,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: {
        pages: [infiniteExpensesInitialData],
        pageParams: [],
      },
    },
  );
}
