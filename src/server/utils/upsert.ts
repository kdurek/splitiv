/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Decimal from 'decimal.js';

export function upsert<T extends { amount: string }>(array: T[], element: T, elementProp: keyof T) {
  const i = array.findIndex((_element) => _element[elementProp] === element[elementProp]);

  if (i > -1) {
    const currentAmount = new Decimal(array[i]!.amount);
    const newAmount = new Decimal(element.amount);
    array[i]!.amount = currentAmount.plus(newAmount).toFixed(2);
  } else {
    array.push(element);
  }
}
