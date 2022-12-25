import { trpc } from "utils/trpc";

function useCreateExpense() {
  const utils = trpc.useContext();

  return trpc.expense.createExpense.useMutation({
    onSuccess(input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
      utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useCreateExpense };
