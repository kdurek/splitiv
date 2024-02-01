import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

export function useChangeCurrentGroup() {
  const router = useRouter();

  return api.group.changeCurrent.useMutation({
    async onSuccess() {
      toast.success('Pomyślnie zmieniono grupę');
      router.refresh();
    },
  });
}
