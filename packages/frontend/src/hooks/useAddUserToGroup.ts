import { trpc } from "utils/trpc";

function useAddUserToGroup() {
  const utils = trpc.useContext();

  return trpc.group.addUserToGroup.useMutation({
    onSuccess(input) {
      utils.group.getGroupById.invalidate({ groupId: input.groupId });
    },
  });
}

export { useAddUserToGroup };
