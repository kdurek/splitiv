import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useUpdateExpenseDebt() {
  const router = useRouter();

  return api.expenseDebt.update.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
