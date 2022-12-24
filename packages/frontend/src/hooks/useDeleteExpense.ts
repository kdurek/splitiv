import { trpc } from "utils/trpc";

function useDeleteExpense() {
  const utils = trpc.useContext();

  return trpc.expenses.deleteExpense.useMutation({
    onSuccess(input) {
      utils.groups.getGroupById.invalidate({ groupId: input.groupId });
      utils.expenses.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useDeleteExpense };
