import type { ExpenseDebt, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

import { upsert } from '@/server/utils/upsert';

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
