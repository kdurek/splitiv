import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useChangeCurrentGroup() {
  const router = useRouter();
  const utils = api.useContext();

  return api.group.changeCurrent.useMutation({
    async onSuccess() {
      await utils.group.getAll.invalidate();
      router.refresh();
    },
  });
}
