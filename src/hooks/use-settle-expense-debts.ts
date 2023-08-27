import { useRouter } from 'next/navigation';

import { api } from '@/utils/api';

export function useSettleExpenseDebts() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expenseDebt.settle.useMutation({
    async onSuccess() {
      await utils.expense.getInfinite.invalidate();
      router.refresh();
    },
  });
}
