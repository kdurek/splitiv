import { api } from "utils/api";

export function useCreateExpense() {
  const utils = api.useContext();

  return api.expense.createExpense.useMutation({
    async onSuccess(input) {
      await utils.user.getCurrentUserUnsettledDebtsByGroup.invalidate({
        groupId: input.groupId,
      });
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}
