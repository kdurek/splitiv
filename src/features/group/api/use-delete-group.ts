import { api } from "utils/api";

export function useDeleteGroup() {
  const utils = api.useContext();

  return api.group.deleteGroupById.useMutation({
    async onSuccess() {
      await utils.group.getGroupsByMe.invalidate();
    },
  });
}
