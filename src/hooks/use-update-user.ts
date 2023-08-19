import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useUpdateUser() {
  const router = useRouter();
  const utils = api.useContext();

  return api.user.update.useMutation({
    async onSuccess(_, variables) {
      await utils.user.getById.invalidate({ userId: variables.userId });
      router.refresh();
    },
  });
}
