import { api } from "utils/api";

function useExpenses(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return api.expense.getExpensesByGroup.useQuery(
    { groupId },
    { enabled: Boolean(groupId) }
  );
}

export { useExpenses };
