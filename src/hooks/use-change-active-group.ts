import { useRouter } from "next/navigation";

import { api } from "utils/api";

export function useChangeActiveGroup() {
  const router = useRouter();
  const utils = api.useContext();

  return api.user.changeActiveGroup.useMutation({
    async onSuccess() {
      await utils.group.getAll.invalidate();
      router.refresh();
    },
  });
}
