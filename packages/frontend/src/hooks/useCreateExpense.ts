import { trpc } from "utils/trpc";

function useCreateExpense() {
  const utils = trpc.useContext();

  return trpc.expense.createExpense.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useCreateExpense };
