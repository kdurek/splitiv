import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';

import { db } from '@/server/db';

export const getDebtsBetweenUsers = async (groupId: string, payerId: string, debtorId: string) => {
  const debts = db.expenseDebt.findMany({
    where: {
      expense: {
        groupId,
        payerId,
      },
      debtorId,
      settled: {
        lt: db.expenseDebt.fields.amount,
      },
    },
    include: {
      expense: {
        include: {
          payer: true,
        },
      },
      debtor: true,
    },
    orderBy: {
      expense: {
        createdAt: 'desc',
      },
    },
  });

  return debts;
};

export const settleByAmount = async (debtId: string, amount: number) => {
  const expenseDebt = await db.$transaction(async (tx) => {
    const debt = await tx.expenseDebt.findUnique({
      where: {
        id: debtId,
      },
    });

    if (!debt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono długu',
      });
    }

    if (Decimal.add(amount, debt.settled).greaterThan(debt.amount)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Kwota do oddania nie może być większa niż kwota do zapłaty',
      });
    }

    await tx.expenseLog.create({
      data: {
        debtId,
        amount,
      },
    });

    return tx.expenseDebt.update({
      where: {
        id: debtId,
      },
      data: {
        settled: Decimal.add(amount, debt.settled),
      },
    });
  });

  return expenseDebt;
};

export const getExpenseDebtById = async (debtId: string) => {
  const expenseDebt = await db.expenseDebt.findUnique({
    where: {
      id: debtId,
    },
    include: {
      expense: true,
    },
  });

  if (!expenseDebt) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Nie znaleziono długu',
    });
  }

  return expenseDebt;
};

export const checkExpenseDebtAccess = async (debtId: string, userId: string) => {
  const expenseDebt = await getExpenseDebtById(debtId);

  if (userId !== expenseDebt.debtorId && userId !== expenseDebt.expense.payerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Tylko osoba płacąca i oddająca dług może go edytować',
    });
  }

  if (expenseDebt.expense.payerId === expenseDebt.debtorId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Nie można edytować kwoty do oddania osoby płacącej',
    });
  }
};
