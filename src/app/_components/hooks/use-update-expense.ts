import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useUpdateExpense() {
  const router = useRouter();
  const utils = api.useUtils();

  return api.expense.update.useMutation({
    async onSuccess() {
      await utils.expense.listInfinite.invalidate();
      router.refresh();
    },
  });
}
