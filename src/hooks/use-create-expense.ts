import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useCreateExpense() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expense.create.useMutation({
    async onSuccess() {
      await utils.expense.getInfinite.invalidate();
      router.refresh();
    },
  });
}
