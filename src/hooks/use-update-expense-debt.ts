import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useUpdateExpenseDebt() {
  const router = useRouter();
  const utils = api.useUtils();

  return api.expenseDebt.update.useMutation({
    async onSuccess() {
      await utils.expense.listInfinite.invalidate();
      router.refresh();
    },
  });
}
