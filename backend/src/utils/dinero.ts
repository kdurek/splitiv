import { Currency, dinero } from "dinero.js";

export function dineroFromString({
  amount: string,
  currency,
  scale,
}: {
  amount: string;
  currency: Currency<number>;
  scale: number;
}) {
  const factor = currency.base ** currency.exponent || scale;
  const amount = Math.round(parseFloat(string) * factor);

  return dinero({ amount, currency, scale });
}
