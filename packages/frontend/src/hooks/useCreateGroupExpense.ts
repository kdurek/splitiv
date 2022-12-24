import { trpc } from "utils/trpc";

function useCreateGroupExpense() {
  const utils = trpc.useContext();

  return trpc.expenses.createExpense.useMutation({
    onSuccess(input) {
      utils.groups.getGroupById.invalidate({ groupId: input.groupId });
      utils.expenses.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useCreateGroupExpense };
