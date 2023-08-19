import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useAddUserToGroup() {
  const router = useRouter();
  const utils = api.useContext();

  return api.group.addUser.useMutation({
    async onSuccess() {
      await utils.group.getCurrent.invalidate();
      await utils.user.getAllNotInCurrentGroup.invalidate();
      router.refresh();
    },
  });
}
