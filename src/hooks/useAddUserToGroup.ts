import { api } from "utils/api";

function useAddUserToGroup() {
  const utils = api.useContext();

  return api.group.addUserToGroup.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
    },
  });
}

export { useAddUserToGroup };
