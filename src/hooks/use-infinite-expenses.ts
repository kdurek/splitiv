import { useAtomValue } from 'jotai';

import { expenseFilterDebtorIdAtom, expenseFilterPayerIdAtom, expenseFilterSearchTextAtom } from '@/lib/atoms';
import type { GetInfiniteExpenses } from '@/utils/api';
import { api } from '@/utils/api';

interface UseInfiniteExpensesProps {
  infiniteExpensesInitialData: GetInfiniteExpenses;
}

export function useInfiniteExpenses({ infiniteExpensesInitialData }: UseInfiniteExpensesProps) {
  const searchText = useAtomValue(expenseFilterSearchTextAtom);
  const payerId = useAtomValue(expenseFilterPayerIdAtom);
  const debtorId = useAtomValue(expenseFilterDebtorIdAtom);

  return api.expense.getInfinite.useInfiniteQuery(
    {
      limit: 10,
      name: searchText,
      description: searchText,
      payerId,
      debtorId,
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
