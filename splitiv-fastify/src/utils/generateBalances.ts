import { PLN } from "@dinero.js/currencies";
import { Dinero, subtract } from "dinero.js";

import { dineroFromString } from "./dinero";
import { upsert } from "./upsert";

export interface IUserBalances {
  userId: string;
  amount: Dinero<number>;
}

export interface IExpenseUser {
  paid: string;
  owed: string;
  userId: string;
}

export function generateBalances(users: IExpenseUser[]) {
  const usersBalanceArray: IUserBalances[] = [];

  users.forEach((user) => {
    const paidAmount = dineroFromString({
      amount: user.paid,
      currency: PLN,
      scale: 2,
    });
    const owedAmount = dineroFromString({
      amount: user.owed,
      currency: PLN,
      scale: 2,
    });
    const netAmount = subtract(paidAmount, owedAmount);
    upsert(
      usersBalanceArray,
      {
        userId: user.userId,
        amount: netAmount,
      },
      "userId"
    );
  });

  return usersBalanceArray;
}
