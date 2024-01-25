/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ExpenseDebt } from '@prisma/client';
import Decimal from 'decimal.js';

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
    array[i]!.amount = new Decimal(array[i]!.amount).plus(new Decimal(element.amount)).toFixed(2);
  } else array.push(element);
}

function reduceDebts(debts: IDebt[]) {
  const debtMap: Record<string, Record<string, Decimal>> = {};

  debts.forEach((debt) => {
    const { fromId } = debt;
    const { toId } = debt;
    const amount = new Decimal(debt.amount);

    if (!debtMap[fromId]) {
      debtMap[fromId] = {};
    }
    if (!debtMap[toId]) {
      debtMap[toId] = {};
    }

    debtMap[fromId]![toId] = (debtMap[fromId]![toId] || new Decimal(0)).plus(amount);
    debtMap[toId]![fromId] = (debtMap[toId]![fromId] || new Decimal(0)).minus(amount);
  });

  const reducedDebts: IDebt[] = [];

  Object.keys(debtMap).forEach((fromId) => {
    Object.keys(debtMap[fromId]!).forEach((toId) => {
      const amount = debtMap[fromId]![toId];
      if (amount && amount.gt(0)) {
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
      const debtAmount = new Decimal(debt.amount).toFixed(2);
      const settledAmount = new Decimal(debt.settled).toFixed(2);
      const netAmount = new Decimal(debtAmount).minus(settledAmount);

      upsertDebt(
        debtsArray,
        {
          fromId: debt.debtorId,
          toId: debt.expense.payerId,
          amount: netAmount.toFixed(2),
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
