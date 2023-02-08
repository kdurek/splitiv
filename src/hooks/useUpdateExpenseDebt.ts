import { api } from "utils/api";

interface UseUpdateExpenseDebtProps {
  groupId: string;
}

function useUpdateExpenseDebt({ groupId }: UseUpdateExpenseDebtProps) {
  const utils = api.useContext();

  return api.expense.updateExpenseDebt.useMutation({
    async onSuccess() {
      await utils.group.getGroupById.invalidate({ groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId,
      });
    },
  });
}

export { useUpdateExpenseDebt };
