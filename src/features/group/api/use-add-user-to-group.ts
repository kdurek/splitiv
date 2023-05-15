import { api } from "utils/api";

import { useActiveGroup } from "../active-group.context";

export function useAddUserToGroup() {
  const { id: groupId } = useActiveGroup();
  const utils = api.useContext();

  return api.group.addUserToGroup.useMutation({
    async onSuccess() {
      await utils.group.getGroupById.invalidate({ groupId });
    },
  });
}
