import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useCreateExpense() {
  const router = useRouter();

  return api.expense.create.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
