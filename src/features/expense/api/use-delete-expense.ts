import { useActiveGroup } from "features/group";
import { api } from "utils/api";

export function useDeleteExpense() {
  const { id: groupId } = useActiveGroup();
  const utils = api.useContext();

  return api.expense.delete.useMutation({
    async onSuccess() {
      await utils.group.getById.invalidate({ groupId });
      await utils.expense.getAll.invalidate({ groupId });
      await utils.expense.getInfinite.invalidate({ groupId });
    },
  });
}
