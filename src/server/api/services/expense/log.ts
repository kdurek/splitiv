import { TRPCError } from '@trpc/server';
import Decimal from 'decimal.js';

import { db } from '@/server/db';

export const revertExpenseLog = async (logId: string) => {
  const expenseLog = await db.$transaction(async (tx) => {
    const expenseLog = await tx.expenseLog.findUnique({
      where: {
        id: logId,
      },
    });

    if (!expenseLog) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono logu wydatku',
      });
    }

    const expenseDebt = await tx.expenseDebt.findUnique({
      where: {
        id: expenseLog.debtId,
      },
      include: {
        expense: {
          include: {
            payer: true,
            group: true,
          },
        },
      },
    });

    if (!expenseDebt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nie znaleziono długu',
      });
    }

    await tx.expenseDebt.update({
      where: {
        id: expenseLog.debtId,
      },
      data: {
        settled: Decimal.sub(expenseDebt.settled, expenseLog.amount),
      },
    });

    await tx.expenseLog.delete({
      where: {
        id: logId,
      },
    });

    return expenseLog;
  });

  return expenseLog;
};

export const getExpenseLogById = async (logId: string) => {
  const expenseLog = await db.expenseLog.findUnique({
    where: {
      id: logId,
    },
    include: {
      debt: {
        include: {
          expense: {
            include: {
              group: true,
            },
          },
        },
      },
    },
  });

  if (!expenseLog) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Nie znaleziono logu wydatku',
    });
  }

  return expenseLog;
};

export const checkExpenseLogAccess = async (userId: string, logId: string) => {
  const expenseLog = await getExpenseLogById(logId);

  if (expenseLog.debt.expense.group.adminId !== userId && expenseLog.debt.expense.payerId !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Nie masz uprawnień do wykonania tej operacji',
    });
  }
};
