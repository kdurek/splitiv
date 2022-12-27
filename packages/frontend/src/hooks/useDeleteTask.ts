import { trpc } from "utils/trpc";

function useDeleteTask() {
  const utils = trpc.useContext();

  return trpc.task.deleteTask.useMutation({
    onSuccess(input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
      utils.task.getTasksByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useDeleteTask };
