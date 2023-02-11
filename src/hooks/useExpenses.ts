import { api } from "utils/api";

interface UseExpensesByGroupProps {
  groupId: string;
  take?: number;
  debtorId?: string;
  settled?: boolean;
}

function useExpensesByGroup({
  groupId,
  take,
  debtorId,
  settled,
}: UseExpensesByGroupProps) {
  return api.expense.getExpensesByGroup.useQuery(
    { groupId, take, debtorId, settled },
    { enabled: Boolean(groupId), keepPreviousData: true }
  );
}

export { useExpensesByGroup };
