import { trpc } from "utils/trpc";

function useDeleteTask() {
  const utils = trpc.useContext();

  return trpc.task.deleteTask.useMutation({
    onMutate: async (input) => {
      await utils.task.getTasksByGroup.cancel({ groupId: input.groupId });
      const previousTasksByGroup = utils.task.getTasksByGroup.getData({
        groupId: input.groupId,
      });
      if (previousTasksByGroup) {
        utils.task.getTasksByGroup.setData(
          { groupId: input.groupId },
          previousTasksByGroup.filter((task) => task.id !== input.taskId)
        );
      }
      return { previousTasksByGroup };
    },
    onError: (error, input, context) => {
      utils.task.getTasksByGroup.setData(
        { groupId: input.groupId },
        context?.previousTasksByGroup
      );
    },
    onSettled(context, error, input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
      utils.task.getTasksByGroup.invalidate({
        groupId: input.groupId,
      });
    },
  });
}

export { useDeleteTask };
