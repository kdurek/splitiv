import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useSettleExpenseDebts() {
  const router = useRouter();

  return api.expenseDebt.settle.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
