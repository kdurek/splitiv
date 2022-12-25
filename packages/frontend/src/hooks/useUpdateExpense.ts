import { trpc } from "utils/trpc";

function useUpdateExpense() {
  const utils = trpc.useContext();

  return trpc.expense.updateExpense.useMutation({
    onSuccess() {
      utils.expense.getExpensesByGroup.invalidate();
    },
  });
}

export { useUpdateExpense };
