import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

export function useUpdateUser() {
  const router = useRouter();

  return api.user.update.useMutation({
    async onSuccess() {
      toast.success('Pomyślnie zaktualizowano użytkownika');
      router.refresh();
    },
  });
}
