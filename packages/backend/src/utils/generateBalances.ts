import { PLN } from "@dinero.js/currencies";
import { Dinero, multiply, subtract, toUnit } from "dinero.js";

import { dineroFromString } from "./dinero";
import { upsert } from "./upsert";

import type { ExpenseDebt } from "@prisma/client";

export interface IUserBalances {
  userId: string;
  amount: Dinero<number>;
}

interface DebtWithExpense extends ExpenseDebt {
  expense: {
    amount: string;
    payerId: string;
  };
}

export function generateBalances(debts: DebtWithExpense[]) {
  const usersBalanceArray: IUserBalances[] = [];

  debts.forEach((debt) => {
    const dineroDebtAmount = dineroFromString({
      amount: debt.amount,
      currency: PLN,
      scale: 2,
    });
    const dineroSettledAmount = dineroFromString({
      amount: debt.settled,
      currency: PLN,
      scale: 2,
    });
    const netDineroAmount = subtract(dineroDebtAmount, dineroSettledAmount);

    if (debt.expense.payerId !== debt.debtorId) {
      upsert(
        usersBalanceArray,
        {
          userId: debt.debtorId,
          amount: multiply(netDineroAmount, -1),
        },
        "userId"
      );
      upsert(
        usersBalanceArray,
        {
          userId: debt.expense.payerId,
          amount: netDineroAmount,
        },
        "userId"
      );
    }
  });

  return usersBalanceArray.map((t) => {
    return { ...t, amount: toUnit(t.amount).toFixed(2) };
  });
}
