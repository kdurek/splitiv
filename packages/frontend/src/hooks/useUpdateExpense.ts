import { trpc } from "utils/trpc";

function useUpdateGroupExpense() {
  const utils = trpc.useContext();

  return trpc.groups.updateExpense.useMutation({
    onSuccess() {
      utils.groups.getExpensesByGroup.invalidate();
    },
  });
}

export { useUpdateGroupExpense };
