import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useDeleteExpense() {
  const router = useRouter();

  return api.expense.delete.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
