import { useActiveGroup } from "features/group";
import { api } from "utils/api";

export function useUpdateExpense() {
  const { id: groupId } = useActiveGroup();
  const utils = api.useContext();

  return api.expense.updateExpense.useMutation({
    async onSuccess() {
      await utils.group.getGroupById.invalidate({ groupId });
      await utils.expense.getExpensesByGroup.invalidate({ groupId });
      await utils.expense.getInfinite.invalidate({ groupId });
    },
  });
}
