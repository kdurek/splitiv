import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

export function useCreateGroup() {
  const router = useRouter();

  return api.group.create.useMutation({
    async onSuccess() {
      toast.success('Pomyślnie utworzono grupę');
      router.refresh();
    },
  });
}
