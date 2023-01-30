import { trpc } from "utils/trpc";

interface UseUpdateExpenseDebtProps {
  groupId: string;
}

function useUpdateExpenseDebt({ groupId }: UseUpdateExpenseDebtProps) {
  const utils = trpc.useContext();

  return trpc.expense.updateExpenseDebt.useMutation({
    onSuccess() {
      utils.group.getGroupById.invalidate({ groupId });
      utils.expense.getExpensesByGroup.invalidate({
        groupId,
      });
    },
  });
}

export { useUpdateExpenseDebt };
