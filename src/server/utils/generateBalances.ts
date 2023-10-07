import type { ExpenseDebt, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

import { upsert } from './upsert';

export interface IUserBalances {
  userId: string;
  amount: string;
}

interface DebtWithExpense extends ExpenseDebt {
  expense: {
    amount: Prisma.Decimal;
    payerId: string;
  };
}

export function generateBalances(debts: DebtWithExpense[]) {
  const usersBalanceArray: IUserBalances[] = [];

  debts.forEach((debt) => {
    const debtAmount = new Decimal(debt.amount);
    const settledAmount = new Decimal(debt.settled);
    const netAmount = debtAmount.minus(settledAmount);

    if (debt.expense.payerId !== debt.debtorId) {
      upsert(
        usersBalanceArray,
        {
          userId: debt.debtorId,
          amount: netAmount.negated().toFixed(2),
        },
        'userId',
      );

      upsert(
        usersBalanceArray,
        {
          userId: debt.expense.payerId,
          amount: netAmount.toFixed(2),
        },
        'userId',
      );
    }
  });

  return usersBalanceArray;
}
