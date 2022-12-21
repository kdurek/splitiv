import { trpc } from "utils/trpc";

function useDeleteExpense() {
  const utils = trpc.useContext();

  return trpc.groups.deleteExpense.useMutation({
    onSuccess(input) {
      utils.groups.getGroupById.invalidate({ groupId: input.groupId });
      utils.groups.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useDeleteExpense };
