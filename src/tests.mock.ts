import Decimal from 'decimal.js';

export const mockExpense = {
  id: '1',
  amount: new Decimal('100.42'),
  payerId: 'user1',
  name: 'Test Expense',
  groupId: 'group1',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  debts: [
    {
      id: '1',
      expenseId: '1',
      debtorId: 'user2',
      amount: new Decimal('50.25'),
      settled: new Decimal('0.00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      expenseId: '1',
      debtorId: 'user3',
      amount: new Decimal('30.17'),
      settled: new Decimal('10.42'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      expenseId: '1',
      debtorId: 'user1',
      amount: new Decimal('20.00'),
      settled: new Decimal('20.00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};
