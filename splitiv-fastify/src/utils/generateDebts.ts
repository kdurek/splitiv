/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import {
  add,
  isNegative,
  isPositive,
  minimum,
  multiply,
  subtract,
  toUnit,
} from "dinero.js";

import { generateBalances } from "./generateBalances";

import type { IExpenseUser } from "./generateBalances";

interface IDebt {
  fromId: string;
  toId: string;
  amount: string;
}

function overwrite<T>(array: T[], element: T, elementProp: keyof T) {
  const i = array.findIndex(
    (_element) => _element[elementProp] === element[elementProp]
  );
  if (i > -1) {
    array[i] = element;
  }
}

export function generateDebts(users: IExpenseUser[]) {
  const usersBalanceArray = generateBalances(users);

  const debts: IDebt[] = [];

  usersBalanceArray.forEach((from) => {
    const { userId: fromId, amount: fromAmount } = from;
    if (isPositive(fromAmount)) {
      usersBalanceArray.forEach((to) => {
        const { userId: toId, amount: toAmount } = to;
        if (toId !== fromId && isNegative(toAmount)) {
          const fromAmountTrue = usersBalanceArray.find(
            (user) => user.userId === fromId
          )!.amount;
          const toAmountPositive = multiply(toAmount, -1);
          const amount = minimum([fromAmountTrue, toAmountPositive]);

          overwrite(
            usersBalanceArray,
            { userId: fromId, amount: subtract(fromAmountTrue, amount) },
            "userId"
          );

          overwrite(
            usersBalanceArray,
            { userId: toId, amount: add(toAmount, amount) },
            "userId"
          );

          debts.push({
            fromId: toId,
            toId: fromId,
            amount: toUnit(amount).toFixed(2),
          });
        }
      });
    }
  });

  return debts;
}
