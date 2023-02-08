import { dinero } from "dinero.js";

import type { Currency } from "dinero.js";

interface DineroFromFloatProps {
  amount: number;
  currency: Currency<number>;
  scale: number;
}

export function dineroFromFloat({
  amount: float,
  currency,
  scale,
}: DineroFromFloatProps) {
  const factor = Number(currency.base) ** Number(currency.exponent) || scale;
  const amount = Math.round(float * factor);

  return dinero({ amount, currency, scale });
}
