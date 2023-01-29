import type { Expense, ExpenseDebt } from "@prisma/client";

interface IDebt {
  fromId: string;
  toId: string;
  amount: string;
}

interface ExpenseWithDebts extends Expense {
  debts: ExpenseDebt[];
}

function upsertDebt<T extends { amount: string }>(
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
    // eslint-disable-next-line no-param-reassign
    array[i]!.amount = (
      parseFloat(array[i]!.amount) + parseFloat(element.amount)
    ).toFixed(2);
  } else array.push(element);
}

function reduceDebts(debts: IDebt[]) {
  const debtMap: { [key: string]: { [key: string]: number } } = {};

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
    Object.keys(debtMap[fromId] as { [key: string]: number }).forEach(
      (toId) => {
        const amount = debtMap[fromId]![toId];
        if (amount && amount > 0) {
          reducedDebts.push({
            fromId,
            toId,
            amount: amount.toFixed(2),
          });
        }
      }
    );
  });

  return reducedDebts;
}

export function generateDebts(expenses: ExpenseWithDebts[]) {
  const debts: IDebt[] = [];

  expenses.forEach((expense) => {
    expense.debts.forEach((debt) => {
      if (debt.debtorId !== expense.payerId) {
        upsertDebt(
          debts,
          {
            fromId: debt.debtorId,
            toId: expense.payerId,
            amount: debt.amount,
          },
          "fromId",
          "toId"
        );
      }
    });
  });

  return reduceDebts(debts);
}
