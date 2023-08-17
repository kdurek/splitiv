import type { Currency } from 'dinero.js';
import { dinero } from 'dinero.js';

export function dineroFromString({
  amount: string,
  currency,
  scale,
}: {
  amount: string;
  currency: Currency<number>;
  scale: number;
}) {
  const factor = Number(currency.base) ** Number(currency.exponent) || scale;
  const amount = Math.round(parseFloat(string) * factor);

  return dinero({ amount, currency, scale });
}
