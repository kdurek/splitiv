import { api } from "utils/api";

interface UseExpensesByGroupProps {
  groupId: string;
  name?: string;
  description?: string;
  payerId?: string;
  debtorId?: string;
  take?: number;
}

function useExpensesByGroup({
  groupId,
  name,
  description,
  payerId,
  debtorId,
  take,
}: UseExpensesByGroupProps) {
  return api.expense.getExpensesByGroup.useQuery(
    { groupId, name, description, payerId, debtorId, take },
    { enabled: Boolean(groupId), keepPreviousData: true }
  );
}

export { useExpensesByGroup };
