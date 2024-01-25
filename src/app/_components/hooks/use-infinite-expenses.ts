import { useAtomValue } from 'jotai';

import { expenseFilterDebtorIdAtom, expenseFilterPayerIdAtom, expenseFilterSearchTextAtom } from '@/lib/atoms';
import { api } from '@/trpc/react';

interface UseInfiniteExpensesProps {
  isSettled?: 'fully' | 'partially';
}

export function useInfiniteExpenses({ isSettled }: UseInfiniteExpensesProps) {
  const searchText = useAtomValue(expenseFilterSearchTextAtom);
  const payerId = useAtomValue(expenseFilterPayerIdAtom);
  const debtorId = useAtomValue(expenseFilterDebtorIdAtom);

  return api.expense.listInfinite.useSuspenseInfiniteQuery(
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
    },
  );
}
