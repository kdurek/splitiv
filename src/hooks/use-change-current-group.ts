import { useRouter } from 'next/navigation';

import { api } from '@/utils/api';

export function useChangeCurrentGroup() {
  const router = useRouter();

  return api.group.changeCurrent.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
