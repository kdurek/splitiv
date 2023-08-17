import { PLN } from '@dinero.js/currencies';
import type { ExpenseDebt } from '@prisma/client';
import { subtract, toUnit } from 'dinero.js';

import { dineroFromString } from './dineroFromString';

export interface IDebt {
  fromId: string;
  toId: string;
  amount: string;
}

interface DebtWithExpense extends ExpenseDebt {
  expense: {
    payerId: string;
  };
}

function upsertDebt<T extends { amount: string }>(
  array: T[],
  element: T,
  elementProp: keyof T,
  secondElementProp: keyof T,
) {
  const i = array.findIndex(
    (_element) =>
      _element[elementProp] === element[elementProp] && _element[secondElementProp] === element[secondElementProp],
  );

  if (i > -1) {
    // eslint-disable-next-line no-param-reassign
    array[i]!.amount = (parseFloat(array[i]!.amount) + parseFloat(element.amount)).toFixed(2);
  } else array.push(element);
}

function reduceDebts(debts: IDebt[]) {
  const debtMap: Record<string, Record<string, number>> = {};

  debts.forEach((debt) => {
    const { fromId } = debt;
    const { toId } = debt;
    const amount = parseFloat(debt.amount);

    if (!debtMap[fromId]) {
      debtMap[fromId] = {};
    }
    if (!debtMap[toId]) {
      debtMap[toId] = {};
    }

    debtMap[fromId]![toId] = (debtMap[fromId]![toId] || 0) + amount;
    debtMap[toId]![fromId] = (debtMap[toId]![fromId] || 0) - amount;
  });

  const reducedDebts: IDebt[] = [];

  Object.keys(debtMap).forEach((fromId) => {
    Object.keys(debtMap[fromId] as Record<string, number>).forEach((toId) => {
      const amount = debtMap[fromId]![toId];
      if (amount && amount > 0) {
        reducedDebts.push({
          fromId,
          toId,
          amount: amount.toFixed(2),
        });
      }
    });
  });

  return reducedDebts;
}

export function generateDebts(debts: DebtWithExpense[]) {
  const debtsArray: IDebt[] = [];

  debts.forEach((debt) => {
    if (debt.debtorId !== debt.expense.payerId) {
      const dineroDebtAmount = dineroFromString({
        amount: Number(debt.amount).toFixed(2),
        currency: PLN,
        scale: 2,
      });
      const dineroSettledAmount = dineroFromString({
        amount: Number(debt.settled).toFixed(2),
        currency: PLN,
        scale: 2,
      });
      const netDineroAmount = subtract(dineroDebtAmount, dineroSettledAmount);

      upsertDebt(
        debtsArray,
        {
          fromId: debt.debtorId,
          toId: debt.expense.payerId,
          amount: toUnit(netDineroAmount).toFixed(2),
        },
        'fromId',
        'toId',
      );
    }
  });

  return debtsArray;
}

export function generateSimplifiedDebts(debts: DebtWithExpense[]) {
  return reduceDebts(generateDebts(debts));
}
