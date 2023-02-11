import { api } from "utils/api";

interface UseExpensesByGroupProps {
  groupId: string;
}

function useExpensesByGroup({ groupId }: UseExpensesByGroupProps) {
  return api.expense.getExpensesByGroup.useQuery(
    { groupId },
    { enabled: Boolean(groupId) }
  );
}

export { useExpensesByGroup };
