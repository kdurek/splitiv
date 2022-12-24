import { trpc } from "utils/trpc";

function useDeleteExpense() {
  const utils = trpc.useContext();

  return trpc.expense.deleteExpense.useMutation({
    onSuccess(input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
      utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useDeleteExpense };
