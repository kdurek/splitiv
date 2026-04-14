type Debtor = { ratio: number; custom: number };

export type ExpenseFormValues = {
  title: string;
  amount: number;
  method: "ratio" | "custom";
  debtors: Debtor[];
};

export function isExpenseSubmitDisabled(v: ExpenseFormValues): boolean {
  if (!v.title.trim() || v.amount <= 0) return true;
  if (v.method === "ratio") return !v.debtors.some((d) => d.ratio > 0);
  if (v.method === "custom") {
    const totalCents = Math.round(v.amount * 100);
    const allocCents = Math.round(v.debtors.reduce((sum, d) => sum + d.custom, 0) * 100);
    return totalCents !== allocCents || allocCents === 0;
  }
  return false;
}
