import { PLN } from "@dinero.js/currencies";
import { Dinero, multiply, toUnit } from "dinero.js";

import { dineroFromString } from "./dinero";
import { upsert } from "./upsert";

import type { Expense, ExpenseDebt } from "@prisma/client";

export interface IUserBalances {
  userId: string;
  amount: Dinero<number>;
}

interface ExpenseWithDebts extends Expense {
  debts: ExpenseDebt[];
}

export function generateBalances(expenses: ExpenseWithDebts[]) {
  const usersBalanceArray: IUserBalances[] = [];

  expenses.forEach((expense) => {
    expense.debts.forEach((debt) => {
      const dineroOwedAmount = dineroFromString({
        amount: debt.amount,
        currency: PLN,
        scale: 2,
      });

      if (expense.payerId !== debt.debtorId) {
        upsert(
          usersBalanceArray,
          {
            userId: debt.debtorId,
            amount: multiply(dineroOwedAmount, -1),
          },
          "userId"
        );
        upsert(
          usersBalanceArray,
          {
            userId: expense.payerId,
            amount: dineroOwedAmount,
          },
          "userId"
        );
      }
    });
  });

  return usersBalanceArray.map((t) => {
    return { ...t, amount: toUnit(t.amount).toFixed(2) };
  });
}
