import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useSettleExpenseDebts() {
  const router = useRouter();
  const utils = api.useUtils();

  return api.expenseDebt.settle.useMutation({
    async onSuccess() {
      await utils.expense.listInfinite.invalidate();
      await utils.expense.list.invalidate();
      router.refresh();
    },
  });
}
