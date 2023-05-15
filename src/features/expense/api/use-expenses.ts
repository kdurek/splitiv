import { api } from "utils/api";

interface UseExpensesProps {
  limit?: number;
  groupId: string;
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: boolean;
}

export function useExpenses({
  limit,
  groupId,
  searchText,
  payerId,
  debtorId,
  isSettled,
}: UseExpensesProps) {
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
