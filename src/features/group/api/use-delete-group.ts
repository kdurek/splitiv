import { api } from "utils/api";

export function useDeleteGroup() {
  const utils = api.useContext();

  return api.group.deleteById.useMutation({
    async onSuccess() {
      await utils.group.getAll.invalidate();
    },
  });
}
