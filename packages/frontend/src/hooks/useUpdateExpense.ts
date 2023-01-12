import { trpc } from "utils/trpc";

function useUpdateExpense() {
  const utils = trpc.useContext();

  return trpc.expense.updateExpense.useMutation({
    onSuccess(input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
      utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useUpdateExpense };
