import { api } from "utils/api";

export function useCreateGroup() {
  const utils = api.useContext();

  return api.group.createGroup.useMutation({
    async onSuccess() {
      await utils.group.getGroupsByMe.invalidate();
    },
  });
}
