import { describe, expect, it } from 'vitest';

import { mockExpense } from '@/tests.mock';

import { getAllRemainingAmount, getUserRemainingAmount } from './expense';

describe('getUserRemainingAmount', () => {
  it('returns correct amount when current user is payer', () => {
    const amount = getUserRemainingAmount(mockExpense, 'user1', 'user2');
    expect(amount.toString()).toBe('50.25');
  });

  it('returns correct amount when current user is debtor', () => {
    const amount = getUserRemainingAmount(mockExpense, 'user2', 'user1');
    expect(amount.toString()).toBe('50.25');
  });

  it('returns correct amount for partially settled debt', () => {
    const amount = getUserRemainingAmount(mockExpense, 'user1', 'user3');
    expect(amount.toString()).toBe('19.75');
  });

  it('returns 0 when user has no debt', () => {
    const amount = getUserRemainingAmount(mockExpense, 'user1', 'user4');
    expect(amount.toString()).toBe('0');
  });
});

describe('getAllRemainingAmount', () => {
  it('returns sum of all unpaid debts when current user is payer', () => {
    const amount = getAllRemainingAmount(mockExpense, 'user1');
    expect(amount.toFixed(2)).toBe('70.00');
  });

  it('returns remaining debt amount when current user is debtor', () => {
    const amount = getAllRemainingAmount(mockExpense, 'user2');
    expect(amount.toString()).toBe('50.25');
  });

  it('returns correct amount for partially settled debt', () => {
    const amount = getAllRemainingAmount(mockExpense, 'user3');
    expect(amount.toString()).toBe('19.75');
  });

  it('returns 0 for user not involved in expense', () => {
    const amount = getAllRemainingAmount(mockExpense, 'user4');
    expect(amount.toString()).toBe('0');
  });

  it('handles archived expenses correctly', () => {
    const archivedExpense = {
      ...mockExpense,
      debts: mockExpense.debts.map((debt) => ({
        ...debt,
        settled: debt.amount,
      })),
    };
    const amount = getAllRemainingAmount(archivedExpense, 'user1');
    expect(amount.toString()).toBe('80.42'); // total amount minus user1's debt
  });
});
