import { api } from "utils/api";

interface UseUpdateExpenseDebtProps {
  groupId: string;
}

export function useUpdateExpenseDebt({ groupId }: UseUpdateExpenseDebtProps) {
  const utils = api.useContext();

  return api.expense.updateExpenseDebt.useMutation({
    async onSuccess() {
      await utils.user.getCurrentUserUnsettledDebtsByGroup.invalidate({
        groupId,
      });
      await utils.group.getGroupById.invalidate({ groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId,
      });
    },
  });
}
