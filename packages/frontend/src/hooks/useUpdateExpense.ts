import { trpc } from "utils/trpc";

function useUpdateGroupExpense() {
  const utils = trpc.useContext();

  return trpc.expenses.updateExpense.useMutation({
    onSuccess() {
      utils.expenses.getExpensesByGroup.invalidate();
    },
  });
}

export { useUpdateGroupExpense };
