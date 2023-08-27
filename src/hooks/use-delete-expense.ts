import { useRouter } from 'next/navigation';

import { api } from '@/utils/api';

export function useDeleteExpense() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expense.delete.useMutation({
    async onSuccess() {
      await utils.expense.getInfinite.invalidate();
      router.refresh();
    },
  });
}
