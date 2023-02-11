import { api } from "utils/api";

interface UseExpensesByGroupProps {
  groupId: string;
  take?: number;
}

function useExpensesByGroup({ groupId, take }: UseExpensesByGroupProps) {
  return api.expense.getExpensesByGroup.useQuery(
    { groupId, take },
    { enabled: Boolean(groupId) }
  );
}

export { useExpensesByGroup };
