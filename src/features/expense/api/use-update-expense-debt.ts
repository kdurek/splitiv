import { useActiveGroup } from "features/group";
import { api } from "utils/api";

export function useUpdateExpenseDebt() {
  const { id: groupId } = useActiveGroup();
  const utils = api.useContext();

  return api.expense.updateExpenseDebt.useMutation({
    async onSuccess() {
      await utils.user.getCurrentUserUnsettledDebtsByGroup.invalidate({
        groupId,
      });
      await utils.group.getGroupById.invalidate({ groupId });
      await utils.expense.getExpensesByGroup.invalidate({ groupId });
      await utils.expense.getInfinite.invalidate({ groupId });
    },
  });
}
