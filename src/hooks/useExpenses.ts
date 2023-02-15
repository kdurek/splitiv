import { api } from "utils/api";

interface UseExpensesByGroupProps {
  groupId: string;
  name?: string;
  description?: string;
  payerId?: string;
  debtorId?: string;
  settled?: boolean;
  take?: number;
}

function useExpenses({
  groupId,
  name = "",
  description = "",
  payerId = undefined,
  debtorId = undefined,
  settled = undefined,
  take = undefined,
}: UseExpensesByGroupProps) {
  return api.expense.getExpensesByGroup.useQuery(
    {
      groupId,
      name,
      description,
      payerId,
      debtorId,
      settled,
      take,
    },
    { enabled: Boolean(groupId), keepPreviousData: true }
  );
}

export { useExpenses };
