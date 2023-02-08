import { api } from "utils/api";

interface UseUpdateExpenseDebtProps {
  groupId: string;
}

function useSettleExpenseDebts({ groupId }: UseUpdateExpenseDebtProps) {
  const utils = api.useContext();

  return api.expense.settleExpenseDebts.useMutation({
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

export { useSettleExpenseDebts };
