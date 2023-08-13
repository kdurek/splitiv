import { useRouter } from "next/navigation";

import { api } from "utils/api";

export function useAddUserToGroup() {
  const router = useRouter();
  const utils = api.useContext();

  return api.group.addUserToGroup.useMutation({
    async onSuccess() {
      await utils.group.getById.invalidate();
      router.refresh();
    },
  });
}
