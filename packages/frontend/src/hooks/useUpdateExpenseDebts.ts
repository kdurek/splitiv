import { trpc } from "utils/trpc";

interface UseUpdateExpenseDebtProps {
  groupId: string;
}

function useSettleExpenseDebts({ groupId }: UseUpdateExpenseDebtProps) {
  const utils = trpc.useContext();

  return trpc.expense.settleExpenseDebts.useMutation({
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
