/* eslint-disable no-param-reassign */
import { Dinero, add } from "dinero.js";

export function upsert<T extends { amount: Dinero<number> }>(
  array: T[],
  element: T,
  elementProp: keyof T
) {
  const i = array.findIndex(
    (_element) => _element[elementProp] === element[elementProp]
  );

  if (i > -1) {
    array[i]!.amount = add(array[i]!.amount, element.amount);
  } else array.push(element);
}
