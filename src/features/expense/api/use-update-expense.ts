import { api } from "utils/api";

export function useUpdateExpense() {
  const utils = api.useContext();

  return api.expense.updateExpense.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
      await utils.expense.getInfinite.invalidate({
        groupId: input.groupId,
      });
    },
  });
}
