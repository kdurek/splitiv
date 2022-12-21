import type { IExpenseUser } from "./generateBalances";

interface IDebt {
  fromId: string;
  toId: string;
  amount: string;
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

export function generateDebts(users: IExpenseUser[]) {
  const fromUsers = users.filter((user) => parseFloat(user.paid) > 0);
  const toUsers = users.filter((user) => parseFloat(user.owed) > 0);

  const debts: IDebt[] = [];

  fromUsers.forEach((from) => {
    const {
      id: fromId,
      expenseId: fromExpenseId,
      userId: fromUserId,
      paid: fromPaid,
      owed: fromOwed,
    } = from;
    toUsers.forEach((to) => {
      const {
        id: toId,
        expenseId: toExpenseId,
        userId: toUserId,
        paid: toPaid,
        owed: toOwed,
      } = to;
      if (
        fromId !== toId &&
        fromUserId !== toUserId &&
        fromExpenseId === toExpenseId
      ) {
        if (parseFloat(fromPaid) > 0 && parseFloat(fromOwed) > 0) {
          upsertDebt(
            debts,
            {
              fromId: toUserId,
              toId: fromUserId,
              amount: toOwed,
            },
            "fromId",
            "toId"
          );
        } else if (fromPaid === toOwed && toPaid === fromOwed) {
          upsertDebt(
            debts,
            {
              fromId: toUserId,
              toId: fromUserId,
              amount: fromPaid,
            },
            "fromId",
            "toId"
          );
        }
      }
    });
  });

  return reduceDebts(debts);
}
