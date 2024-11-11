import type { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

type ExpenseWithDebts = Prisma.ExpenseGetPayload<{
  include: {
    debts: true;
  };
}>;

function findUserDebt(expense: ExpenseWithDebts, userId: string) {
  return expense.debts.find((debt) => debt.debtorId === userId);
}

function getRemainingDebtAmount(debtAmount: Decimal, settledAmount: Decimal) {
  return Decimal.sub(debtAmount, settledAmount);
}

function sumUnpaidDebts(expense: ExpenseWithDebts, excludeUserId?: string) {
  return expense.debts.reduce((total, debt) => {
    if (excludeUserId && debt.debtorId === excludeUserId) {
      return total;
    }

    const remainingAmount = getRemainingDebtAmount(debt.amount, debt.settled);
    return Decimal.add(total, remainingAmount);
  }, new Decimal(0));
}

export function getUserRemainingAmount(expense: ExpenseWithDebts, currentUserId: string, otherUserId: string): Decimal {
  const isCurrentUserPayer = expense.payerId === currentUserId;

  if (isCurrentUserPayer) {
    const otherUserDebt = findUserDebt(expense, otherUserId);
    return otherUserDebt ? getRemainingDebtAmount(otherUserDebt.amount, otherUserDebt.settled) : new Decimal(0);
  }

  const currentUserDebt = findUserDebt(expense, currentUserId);
  return currentUserDebt ? getRemainingDebtAmount(currentUserDebt.amount, currentUserDebt.settled) : new Decimal(0);
}

export function getAllRemainingAmount(expense: ExpenseWithDebts, currentUserId: string): Decimal {
  const userDebt = findUserDebt(expense, currentUserId);
  const isCurrentUserPayer = expense.payerId === currentUserId;

  // Calculate total unpaid amount excluding payer
  const unpaidDebtsExcludingPayer = sumUnpaidDebts(expense, expense.payerId);
  const isArchived = unpaidDebtsExcludingPayer.isZero();

  if (isCurrentUserPayer) {
    if (isArchived) {
      // When archived, return total amount minus user's debt (if any)
      return userDebt
        ? Decimal.sub(expense.amount, userDebt.amount)
        : Decimal.sub(expense.amount, unpaidDebtsExcludingPayer);
    }

    // Sum of all unpaid debts except current user's
    return sumUnpaidDebts(expense, currentUserId);
  }

  if (userDebt) {
    return userDebt.amount === userDebt.settled
      ? userDebt.amount
      : getRemainingDebtAmount(userDebt.amount, userDebt.settled);
  }

  return new Decimal(0);
}
