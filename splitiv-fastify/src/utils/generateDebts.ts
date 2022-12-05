/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import {
  Dinero,
  add,
  equal,
  isNegative,
  isPositive,
  isZero,
  subtract,
  toUnit,
} from "dinero.js";

import { IExpenseUser, generateBalances } from "./generateBalances";
import { upsert } from "./upsert";

interface IDebt {
  fromId: string;
  toId: string;
  amount: Dinero<number>;
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

  for (const { userId: paidId, amount: paidAmount } of usersBalanceArray) {
    if (isZero(paidAmount)) {
      continue;
    }

    for (const { userId: owedId, amount: owedAmount } of usersBalanceArray) {
      if (
        paidId === owedId ||
        equal(paidAmount, owedAmount) ||
        isZero(owedAmount)
      ) {
        continue;
      }

      if (isNegative(paidAmount) && isNegative(owedAmount)) {
        continue;
      }

      if (isPositive(paidAmount) && isPositive(owedAmount)) {
        continue;
      }

      if (isPositive(owedAmount)) {
        overwrite(
          usersBalanceArray,
          { userId: paidId, amount: subtract(paidAmount, paidAmount) },
          "userId"
        );
        overwrite(
          usersBalanceArray,
          { userId: owedId, amount: add(owedAmount, paidAmount) },
          "userId"
        );
        upsert(
          debts,
          {
            fromId: paidId,
            toId: owedId,
            amount: paidAmount,
          },
          "fromId"
        );
        break;
      }

      if (isNegative(owedAmount)) {
        overwrite(
          usersBalanceArray,
          { userId: paidId, amount: add(paidAmount, owedAmount) },
          "userId"
        );
        overwrite(
          usersBalanceArray,
          { userId: owedId, amount: subtract(owedAmount, owedAmount) },
          "userId"
        );

        upsert(
          debts,
          {
            fromId: owedId,
            toId: paidId,
            amount: owedAmount,
          },
          "fromId"
        );
        break;
      }
    }
  }

  const translatedDebts = debts.map((debt) => {
    return { ...debt, amount: Math.abs(toUnit(debt.amount)).toFixed(2) };
  });

  return translatedDebts;
}
