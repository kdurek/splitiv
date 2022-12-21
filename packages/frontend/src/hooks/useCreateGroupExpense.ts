import { trpc } from "utils/trpc";

function useCreateGroupExpense() {
  const utils = trpc.useContext();

  return trpc.groups.createExpense.useMutation({
    onSuccess(input) {
      utils.groups.getGroupById.invalidate({ groupId: input.groupId });
      utils.groups.getExpensesByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useCreateGroupExpense };
