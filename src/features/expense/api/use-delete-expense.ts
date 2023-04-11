import { api } from "utils/api";

export function useDeleteExpense() {
  const utils = api.useContext();

  return api.expense.deleteExpense.useMutation({
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
