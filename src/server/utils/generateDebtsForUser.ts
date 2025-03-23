import type { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

import { db } from '@/server/db';

const includeConfig = {
  debtor: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
  expense: {
    include: {
      debts: {
        select: {
          debtorId: true,
          amount: true,
          settled: true,
        },
      },
      payer: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
};

type DebtRecord = Prisma.ExpenseDebtGetPayload<{
  include: typeof includeConfig;
}>;

export async function generateDebtsForUser(groupId: string, userId: string) {
  const debtRecords = await db.expenseDebt.findMany({
    where: {
      expense: {
        groupId,
      },
      settled: { lt: db.expenseDebt.fields.amount },
      OR: [
        {
          expense: {
            payerId: userId,
          },
          debtorId: { not: userId },
        },
        {
          debtorId: userId,
          expense: {
            payerId: { not: userId },
          },
        },
      ],
    },
    include: includeConfig,
  });

  const userBalances: Record<
    string,
    {
      user: DebtRecord['debtor'];
      creditsAmount: Decimal;
      credits: DebtRecord['expense'][];
      debtsAmount: Decimal;
      debts: DebtRecord['expense'][];
    }
  > = {};

  debtRecords.forEach((record) => {
    const { debtorId, amount, settled, expense } = record;
    const payerId = expense.payerId;

    if (!userBalances[debtorId]) {
      userBalances[debtorId] = {
        user: record.debtor,
        creditsAmount: new Decimal(0),
        credits: [],
        debtsAmount: new Decimal(0),
        debts: [],
      };
    }
    if (!userBalances[payerId]) {
      userBalances[payerId] = {
        user: record.expense.payer,
        creditsAmount: new Decimal(0),
        credits: [],
        debtsAmount: new Decimal(0),
        debts: [],
      };
    }

    const unsettledAmount = Decimal.sub(amount, settled);

    userBalances[debtorId].creditsAmount = Decimal.add(userBalances[debtorId].creditsAmount, unsettledAmount);
    userBalances[debtorId].credits = [...userBalances[debtorId].credits, expense];
    userBalances[payerId].debtsAmount = Decimal.add(userBalances[payerId].debtsAmount, unsettledAmount);
    userBalances[payerId].debts = [...userBalances[payerId].debts, expense];
  });

  const result = Object.values(userBalances)
    .map((balance) => ({
      user: balance.user,
      creditsAmount: balance.creditsAmount.toFixed(2),
      credits: balance.credits,
      debtsAmount: balance.debtsAmount.toFixed(2),
      debts: balance.debts,
    }))
    .sort((a, b) => (a.user?.name ?? '').localeCompare(b.user?.name ?? ''));

  return result;
}
