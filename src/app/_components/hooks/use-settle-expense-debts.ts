import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

export function useSettleExpenseDebts() {
  const router = useRouter();

  return api.expenseDebt.settle.useMutation({
    async onSuccess() {
      toast.success('Pomyślnie rozliczono długi');
      router.refresh();
    },
  });
}
