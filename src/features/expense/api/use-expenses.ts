import { useActiveGroup } from "features/group";
import { api } from "utils/api";

interface UseExpensesProps {
  limit?: number;
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: boolean;
}

export function useExpenses({
  limit,
  searchText,
  payerId,
  debtorId,
  isSettled,
}: UseExpensesProps) {
  const { id: groupId } = useActiveGroup();

  return api.expense.getExpensesByGroup.useQuery({
    limit,
    groupId,
    name: searchText,
    description: searchText,
    payerId,
    debtorId,
    isSettled,
  });
}
