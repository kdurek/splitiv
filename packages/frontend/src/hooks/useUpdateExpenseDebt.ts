import { trpc } from "utils/trpc";

function useUpdateExpenseDebt() {
  const utils = trpc.useContext();

  return trpc.expense.updateExpenseDebt.useMutation({
    onSuccess(_, variables) {
      utils.group.getGroupById.invalidate({ groupId: variables.groupId });
      utils.expense.getExpensesByGroup.invalidate({
        groupId: variables.groupId,
      });
    },
  });
}

export { useUpdateExpenseDebt };
