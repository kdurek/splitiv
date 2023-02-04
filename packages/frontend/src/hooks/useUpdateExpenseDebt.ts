import { trpc } from "utils/trpc";

interface UseUpdateExpenseDebtProps {
  groupId: string;
}

function useUpdateExpenseDebt({ groupId }: UseUpdateExpenseDebtProps) {
  const utils = trpc.useContext();

  return trpc.expense.updateExpenseDebt.useMutation({
    async onSuccess() {
      await utils.group.getGroupById.invalidate({ groupId });
      await utils.expense.getExpensesByGroup.invalidate({
        groupId,
      });
    },
  });
}

export { useUpdateExpenseDebt };
