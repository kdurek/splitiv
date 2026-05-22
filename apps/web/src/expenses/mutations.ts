import { mutationOptions } from "@tanstack/react-query";

import { $deleteExpense, $settleDebt, $settleDebts, $undoDebtLog } from "./functions";

export const settleDebtMutationOptions = () =>
  mutationOptions({
    mutationFn: (data: { debtId: string; amount: string }) => $settleDebt({ data }),
  });

export const settleDebtsMutationOptions = () =>
  mutationOptions({
    mutationFn: (debts: { debtId: string; amount: string }[]) => $settleDebts({ data: { debts } }),
  });

export const undoDebtLogMutationOptions = () =>
  mutationOptions({
    mutationFn: (logId: string) => $undoDebtLog({ data: { logId } }),
  });

export const deleteExpenseMutationOptions = () =>
  mutationOptions({
    mutationFn: (expenseId: string) => $deleteExpense({ data: { expenseId } }),
  });
