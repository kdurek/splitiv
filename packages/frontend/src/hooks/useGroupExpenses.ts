import { trpc } from "utils/trpc";

function useGroupExpenses(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return trpc.groups.getExpensesByGroup.useQuery(
    { groupId },
    { enabled: Boolean(groupId) }
  );
}

export { useGroupExpenses };