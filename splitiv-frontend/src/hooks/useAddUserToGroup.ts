import { trpc } from "utils/trpc";

function useAddUserToGroup() {
  const utils = trpc.useContext();

  return trpc.groups.addUserToGroup.useMutation({
    onSuccess(input) {
      utils.groups.getGroupById.invalidate({ groupId: input.groupId });
    },
  });
}

export { useAddUserToGroup };
