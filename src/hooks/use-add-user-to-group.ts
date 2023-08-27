import { useRouter } from 'next/navigation';

import { api } from '@/utils/api';

export function useAddUserToGroup() {
  const router = useRouter();

  return api.group.addUser.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
