import type { IExpenseUser } from "./generateBalances";

interface IDebt {
  fromId: string;
  toId: string;
  amount: string;
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
        debts.push({
          fromId: toId,
          toId: fromId,
          amount: fromAmount,
        });
      }
    });
  });

  return debts;
}
