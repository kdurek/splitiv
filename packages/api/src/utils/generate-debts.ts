/** biome-ignore-all lint/style/useFilenamingConvention: false positive */
/** biome-ignore-all lint/style/noNonNullAssertion: false positive */
import Decimal from "decimal.js";
import type { Prisma } from "../../../db/prisma/generated/client";

export type IDebt = {
  fromId: string;
  toId: string;
  amount: Decimal;
};

export type DebtWithExpense = Prisma.ExpenseDebtGetPayload<{
  select: {
    amount: true;
    settled: true;
    debtorId: true;
    expense: {
      select: {
        payerId: true;
      };
    };
  };
}>;

function upsertDebt<T extends { amount: Decimal }>(
  array: T[],
  element: T,
  elementProp: keyof T,
  secondElementProp: keyof T
) {
  const i = array.findIndex(
    (_element) =>
      _element[elementProp] === element[elementProp] &&
      _element[secondElementProp] === element[secondElementProp]
  );

  if (i > -1) {
    array[i]!.amount = new Decimal(array[i]!.amount).plus(
      new Decimal(element.amount)
    );
  } else {
    array.push(element);
  }
}

function reduceDebts(debts: IDebt[]) {
  const debtMap: Record<string, Record<string, Decimal>> = {};

  for (const debt of debts) {
    const { fromId } = debt;
    const { toId } = debt;
    const amount = new Decimal(debt.amount);

    if (!debtMap[fromId]) {
      debtMap[fromId] = {};
    }
    if (!debtMap[toId]) {
      debtMap[toId] = {};
    }

    debtMap[fromId][toId] = (debtMap[fromId][toId] || new Decimal(0)).plus(
      amount
    );
    debtMap[toId][fromId] = (debtMap[toId][fromId] || new Decimal(0)).minus(
      amount
    );
  }

  const reducedDebts: IDebt[] = [];

  for (const fromId of Object.keys(debtMap)) {
    for (const toId of Object.keys(debtMap[fromId]!)) {
      const amount = debtMap[fromId]?.[toId];
      if (amount?.gt(0)) {
        reducedDebts.push({
          fromId,
          toId,
          amount,
        });
      }
    }
  }

  return reducedDebts;
}

export function generateDebts(debts: DebtWithExpense[]) {
  const debtsArray: IDebt[] = [];

  for (const debt of debts) {
    if (debt.debtorId !== debt.expense.payerId) {
      const debtAmount = new Decimal(debt.amount).toFixed(2);
      const settledAmount = new Decimal(debt.settled).toFixed(2);
      const netAmount = new Decimal(debtAmount).minus(settledAmount);

      upsertDebt(
        debtsArray,
        {
          fromId: debt.debtorId,
          toId: debt.expense.payerId,
          amount: netAmount,
        },
        "fromId",
        "toId"
      );
    }
  }

  return debtsArray;
}

export function generateSimplifiedDebts(debts: DebtWithExpense[]) {
  return reduceDebts(generateDebts(debts));
}
