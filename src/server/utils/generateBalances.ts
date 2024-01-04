import type { ExpenseDebt, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

export interface UserBalance {
  userId: string;
  amount: string;
}

export interface DebtWithExpense extends Pick<ExpenseDebt, 'amount' | 'settled' | 'debtorId'> {
  expense: {
    amount: Prisma.Decimal;
    payerId: string;
  };
}

export function generateBalances(debts: DebtWithExpense[]) {
  const usersBalanceArray: UserBalance[] = [];

  debts.forEach((debt) => {
    const debtAmount = new Decimal(debt.amount);
    const settledAmount = new Decimal(debt.settled);
    const netAmount = debtAmount.minus(settledAmount);

    if (debt.expense.payerId !== debt.debtorId) {
      const debtorBalance = usersBalanceArray.find((userBalance) => userBalance.userId === debt.debtorId);
      if (debtorBalance) {
        debtorBalance.amount = new Decimal(debtorBalance.amount).minus(netAmount).toFixed(2);
      } else {
        usersBalanceArray.push({
          userId: debt.debtorId,
          amount: netAmount.negated().toFixed(2),
        });
      }

      const payerBalance = usersBalanceArray.find((userBalance) => userBalance.userId === debt.expense.payerId);
      if (payerBalance) {
        payerBalance.amount = new Decimal(payerBalance.amount).plus(netAmount).toFixed(2);
      } else {
        usersBalanceArray.push({
          userId: debt.expense.payerId,
          amount: netAmount.toFixed(2),
        });
      }
    }
  });

  return usersBalanceArray;
}
