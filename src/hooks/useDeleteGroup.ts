import { api } from "utils/api";

function useDeleteGroup() {
  const utils = api.useContext();

  return api.group.deleteGroupById.useMutation({
    async onSuccess() {
      await utils.group.getGroupsByMe.invalidate();
    },
  });
}

export { useDeleteGroup };
