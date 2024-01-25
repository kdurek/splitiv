import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useUpdateExpense() {
  const router = useRouter();

  return api.expense.update.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
