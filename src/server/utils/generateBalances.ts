import { PLN } from "@dinero.js/currencies";
import { multiply, subtract, toDecimal } from "dinero.js";

import { dineroFromString } from "./dineroFromString";
import { upsert } from "./upsert";

import type { ExpenseDebt, Prisma } from "@prisma/client";
import type { Dinero } from "dinero.js";

export interface IUserBalances {
  userId: string;
  amount: Dinero<number>;
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
    const dineroDebtAmount = dineroFromString({
      amount: Number(debt.amount).toFixed(2),
      currency: PLN,
      scale: 2,
    });
    const dineroSettledAmount = dineroFromString({
      amount: Number(debt.settled).toFixed(2),
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
    return { ...t, amount: toDecimal(t.amount) };
  });
}
