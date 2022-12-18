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

export function generateDebts(users: IExpenseUser[]) {
  const fromUsers = users.filter((user) => parseFloat(user.paid) > 0);
  const toUsers = users.filter((user) => parseFloat(user.owed) > 0);

  const debts: IDebt[] = [];

  fromUsers.forEach((from) => {
    const { userId: fromId, paid: fromAmount } = from;
    toUsers.forEach((to) => {
      const { userId: toId, owed: toAmount } = to;
      if (fromAmount === toAmount) {
        upsertDebt(
          debts,
          {
            fromId: toId,
            toId: fromId,
            amount: fromAmount,
          },
          "fromId",
          "toId"
        );
      }
    });
  });

  return debts;
}
