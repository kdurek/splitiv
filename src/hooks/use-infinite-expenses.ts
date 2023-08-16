import { api } from "utils/api";

import type { GetInfiniteExpenses } from "utils/api";

interface UseInfiniteExpensesProps {
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: boolean;
  infiniteExpensesInitialData: GetInfiniteExpenses;
}

export function useInfiniteExpenses({
  searchText,
  payerId,
  debtorId,
  isSettled,
  infiniteExpensesInitialData,
}: UseInfiniteExpensesProps) {
  return api.expense.getInfinite.useInfiniteQuery(
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
    }
  );
}
