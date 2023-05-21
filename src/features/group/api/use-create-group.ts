import { api } from "utils/api";

export function useCreateGroup() {
  const utils = api.useContext();

  return api.group.create.useMutation({
    async onSuccess() {
      await utils.group.getAll.invalidate();
    },
  });
}
