import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useUpdateExpenseDebt() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expense.updateDebt.useMutation({
    async onSuccess() {
      await utils.group.getById.invalidate();
      await utils.expense.getAll.invalidate();
      await utils.expense.getInfinite.invalidate();
      router.refresh();
    },
  });
}
