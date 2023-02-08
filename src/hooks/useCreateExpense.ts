import { api } from "utils/api";

function useCreateExpense() {
  const utils = api.useContext();

  return api.expense.createExpense.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useCreateExpense };
