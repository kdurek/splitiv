import { useActiveGroup } from "features/group";
import { api } from "utils/api";

interface UseInfiniteExpensesProps {
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: boolean;
}

export function useInfiniteExpenses({
  searchText,
  payerId,
  debtorId,
  isSettled,
}: UseInfiniteExpensesProps) {
  const { id: groupId } = useActiveGroup();

  return api.expense.getInfinite.useInfiniteQuery(
    {
      limit: 10,
      groupId,
      name: searchText,
      description: searchText,
      payerId,
      debtorId,
      isSettled,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
}