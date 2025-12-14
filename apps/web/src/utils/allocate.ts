import { Decimal } from "decimal.js";

export function allocate(
  items: {
    debtorId: string;
    ratio: number;
  }[],
  amount: number
) {
  const totalRatio = items.reduce((acc, item) => acc + item.ratio, 0);

  if (totalRatio === 0) {
    return items.map((item) => ({
      debtorId: item.debtorId,
      amount: 0,
    }));
  }

  const amountInCents = new Decimal(amount).mul(100).toDP(0).toNumber();

  let totalAllocatedCents = 0;
  const debtsInCents = items.map((item) => {
    const share = Math.floor((amountInCents * item.ratio) / totalRatio);
    totalAllocatedCents += share;
    return {
      debtorId: item.debtorId,
      amount: share,
    };
  });

  let remainder = amountInCents - totalAllocatedCents;

  for (let i = 0; i < items.length; i++) {
    if (remainder > 0 && items[i].ratio > 0) {
      debtsInCents[i].amount += 1;
      remainder -= 1;
    }
  }

  return debtsInCents.map((debt) => ({
    ...debt,
    amount: new Decimal(debt.amount).div(100).toNumber(),
  }));
}
