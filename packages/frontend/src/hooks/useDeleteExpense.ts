import { trpc } from "utils/trpc";

function useDeleteExpense() {
  const utils = trpc.useContext();

  return trpc.expense.deleteExpense.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useDeleteExpense };
