import { trpc } from "utils/trpc";

function useCreateTask() {
  const utils = trpc.useContext();

  return trpc.task.createTask.useMutation({
    onSuccess(input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
      utils.task.getTasksByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useCreateTask };
