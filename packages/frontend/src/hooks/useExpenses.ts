import { trpc } from "utils/trpc";

function useExpenses(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return trpc.expense.getExpensesByGroup.useQuery(
    { groupId },
    { enabled: Boolean(groupId) }
  );
}

export { useExpenses };
