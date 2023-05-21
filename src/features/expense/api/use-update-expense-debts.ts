import { useActiveGroup } from "features/group";
import { api } from "utils/api";

export function useSettleExpenseDebts() {
  const { id: groupId } = useActiveGroup();
  const utils = api.useContext();

  return api.expense.settleDebts.useMutation({
    async onSuccess() {
      await utils.group.getById.invalidate({ groupId });
      await utils.expense.getAll.invalidate({ groupId });
      await utils.expense.getInfinite.invalidate({ groupId });
      await utils.debt.getAll.invalidate({ groupId });
    },
  });
}
