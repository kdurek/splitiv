import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useUpdateExpenseDebt() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expenseDebt.update.useMutation({
    async onSuccess() {
      await utils.group.getCurrent.invalidate();
      await utils.expense.getInfinite.invalidate();
      router.refresh();
    },
  });
}
