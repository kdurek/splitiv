import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

export function useDeleteExpense() {
  const router = useRouter();

  return api.expense.delete.useMutation({
    async onSuccess() {
      toast.success('Pomyślnie usunięto wydatek');
      router.refresh();
    },
  });
}
