import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useCreateGroup() {
  const router = useRouter();

  return api.group.create.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}