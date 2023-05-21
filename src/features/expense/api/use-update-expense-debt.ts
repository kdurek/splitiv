import { useActiveGroup } from "features/group";
import { api } from "utils/api";

export function useUpdateExpenseDebt() {
  const { id: groupId } = useActiveGroup();
  const utils = api.useContext();

  return api.expense.updateDebt.useMutation({
    async onSuccess() {
      await utils.group.getById.invalidate({ groupId });
      await utils.expense.getAll.invalidate({ groupId });
      await utils.expense.getInfinite.invalidate({ groupId });
    },
  });
}
