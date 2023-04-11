import { api } from "utils/api";

export function useCreateTask() {
  const utils = api.useContext();

  return api.task.createTask.useMutation({
    async onMutate(input) {
      await utils.task.getTasksByGroup.cancel({ groupId: input.groupId });
      const previousTasksByGroup = utils.task.getTasksByGroup.getData({
        groupId: input.groupId,
      });
      if (previousTasksByGroup) {
        utils.task.getTasksByGroup.setData({ groupId: input.groupId }, [
          {
            id: Math.random().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...input,
          },
          ...previousTasksByGroup,
        ]);
      }
      return { previousTasksByGroup };
    },
    onError(error, input, context) {
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
