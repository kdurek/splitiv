import { useRouter } from 'next/navigation';

import { api } from '@/trpc/react';

export function useCreateExpenseNote() {
  const router = useRouter();

  return api.expenseNote.create.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
