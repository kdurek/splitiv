type Debtor = { userId: string; ratio: number; custom: number };

export type ExpenseFormValues = {
  title: string;
  amount: number;
  payerId: string;
  method: "ratio" | "custom";
  debtors: Debtor[];
};

export function isExpenseSubmitDisabled(v: ExpenseFormValues): boolean {
  if (!v.title.trim() || v.amount <= 0) return true;
  if (v.method === "ratio") {
    const activeDebtors = v.debtors.filter((d) => d.ratio > 0);
    if (activeDebtors.length === 0) return true;
    if (activeDebtors.every((d) => d.userId === v.payerId)) return true;
  }
  if (v.method === "custom") {
    const totalCents = Math.round(v.amount * 100);
    const allocCents = Math.round(v.debtors.reduce((sum, d) => sum + d.custom, 0) * 100);
    if (totalCents !== allocCents || allocCents === 0) return true;
    const activeDebtors = v.debtors.filter((d) => d.custom > 0);
    if (activeDebtors.every((d) => d.userId === v.payerId)) return true;
  }
  return false;
}
