import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useSettleExpenseDebts() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expenseDebt.settle.useMutation({
    async onSuccess() {
      await utils.group.getCurrent.invalidate();
      await utils.expense.getInfinite.invalidate();
      await utils.expenseDebt.getAll.invalidate();
      router.refresh();
    },
  });
}
