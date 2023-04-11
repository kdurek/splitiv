import { api } from "utils/api";

export function useAddUserToGroup() {
  const utils = api.useContext();

  return api.group.addUserToGroup.useMutation({
    async onSuccess(input) {
      await utils.group.getGroupById.invalidate({ groupId: input.groupId });
    },
  });
}
