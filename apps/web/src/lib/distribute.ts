export function distributeByRatio(
  totalAmount: number,
  debtors: { userId: string; ratio: number }[],
): { debtorId: string; amount: string }[] {
  const included = debtors.filter((d) => d.ratio > 0);
  if (included.length === 0 || totalAmount <= 0) return [];

  const ratioSum = included.reduce((sum, d) => sum + d.ratio, 0);
  const totalCents = Math.round(totalAmount * 100);
  const rawCents = included.map((d) => (d.ratio / ratioSum) * totalCents);
  const floorCents = rawCents.map(Math.floor);
  const remainder = totalCents - floorCents.reduce((a, b) => a + b, 0);

  const sorted = rawCents
    .map((r, i) => ({ i, frac: r - floorCents[i] }))
    .sort((a, b) => b.frac - a.frac);

  for (let k = 0; k < remainder; k++) {
    floorCents[sorted[k].i]++;
  }

  return included.map((d, i) => ({
    debtorId: d.userId,
    amount: (floorCents[i] / 100).toFixed(2),
  }));
}
