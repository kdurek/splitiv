import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useChangeCurrentGroup() {
  const router = useRouter();

  return api.group.changeCurrent.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
