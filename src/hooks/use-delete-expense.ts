import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useDeleteExpense() {
  const router = useRouter();
  const utils = api.useUtils();

  return api.expense.delete.useMutation({
    async onSuccess() {
      await utils.expense.getInfinite.invalidate();
      router.refresh();
    },
  });
}
