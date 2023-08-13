import { useRouter } from "next/navigation";

import { api } from "utils/api";

export function useDeleteGroup() {
  const router = useRouter();
  const utils = api.useContext();

  return api.group.deleteById.useMutation({
    async onSuccess() {
      await utils.group.getAll.invalidate();
      router.refresh();
    },
  });
}
