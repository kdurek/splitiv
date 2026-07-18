export interface AllocatableDebt {
  debtId: string;
  amount: string;
  settled: string;
  expenseCreatedAt: string | Date;
}

function toGrosz(value: string) {
  return Math.round(Number(value) * 100);
}

export function allocateExact(
  debts: AllocatableDebt[],
  targetAmount: number,
): { selectedIds: string[]; partial: { debtId: string; amount: string } | null } {
  const sorted = [...debts].sort((a, b) => {
    const dateDiff =
      new Date(a.expenseCreatedAt).getTime() - new Date(b.expenseCreatedAt).getTime();
    return dateDiff !== 0 ? dateDiff : a.debtId.localeCompare(b.debtId);
  });

  const selectedIds: string[] = [];
  let partial: { debtId: string; amount: string } | null = null;
  let remainingTarget = Math.round(targetAmount * 100);

  for (const debt of sorted) {
    if (remainingTarget <= 0) break;
    const remainingGrosz = toGrosz(debt.amount) - toGrosz(debt.settled);
    if (remainingGrosz <= 0) continue;
    const consumeGrosz = Math.min(remainingGrosz, remainingTarget);

    selectedIds.push(debt.debtId);
    if (consumeGrosz < remainingGrosz) {
      partial = { debtId: debt.debtId, amount: (consumeGrosz / 100).toFixed(2) };
    }
    remainingTarget -= consumeGrosz;
  }

  return { selectedIds, partial };
}
