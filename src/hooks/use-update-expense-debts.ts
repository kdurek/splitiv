import { useRouter } from "next/navigation";

import { api } from "utils/api";

export function useSettleExpenseDebts() {
  const router = useRouter();
  const utils = api.useContext();

  return api.expense.settleDebts.useMutation({
    async onSuccess() {
      await utils.group.getById.invalidate();
      await utils.expense.getAll.invalidate();
      await utils.expense.getInfinite.invalidate();
      await utils.debt.getAll.invalidate();
      router.refresh();
    },
  });
}
