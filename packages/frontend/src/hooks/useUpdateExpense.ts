import { trpc } from "utils/trpc";

function useUpdateExpense() {
  const utils = trpc.useContext();

  return trpc.expense.updateExpense.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useUpdateExpense };
