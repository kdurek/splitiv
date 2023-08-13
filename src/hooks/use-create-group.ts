import { useRouter } from "next/navigation";

import { api } from "utils/api";

export function useCreateGroup() {
  const router = useRouter();
  const utils = api.useContext();

  return api.group.create.useMutation({
    async onSuccess() {
      await utils.group.getAll.invalidate();
      router.refresh();
    },
  });
}
