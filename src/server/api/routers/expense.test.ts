import type { inferProcedureInput } from '@trpc/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type AppRouter, createCaller } from '@/server/api/root';
import { createInnerTRPCContext } from '@/server/api/trpc';
import { type Session, type User } from '@/server/auth';
import { db } from '@/server/db';

const mockSession: Session = {
  id: 'session1',
  expiresAt: new Date(),
  token: 'token1',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user1',
};

const mockUser: User = {
  id: 'user1',
  name: 'name1',
  email: 'user1@example.com',
  emailVerified: true,
  image: 'https://example.com/image.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  firstName: 'firstName1',
  lastName: 'lastName1',
  activeGroupId: 'group1',
};

describe('expenseRouter', async () => {
  beforeAll(async () => {
    await db.user.createMany({
      data: [
        mockUser,
        {
          id: 'user2',
          name: 'name2',
          firstName: 'firstName2',
          lastName: 'lastName2',
          email: 'user2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user3',
          name: 'name3',
          firstName: 'firstName3',
          lastName: 'lastName3',
          email: 'user3@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user4',
          name: 'name4',
          firstName: 'firstName4',
          lastName: 'lastName4',
          email: 'user4@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user5',
          name: 'name5',
          firstName: 'firstName5',
          lastName: 'lastName5',
          email: 'user5@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    await db.group.createMany({
      data: [
        {
          id: 'group1',
          name: 'name1',
          adminId: 'user1',
        },
      ],
    });

    await db.userGroup.createMany({
      data: [
        {
          userId: 'user1',
          groupId: 'group1',
        },
        {
          userId: 'user2',
          groupId: 'group1',
        },
        {
          userId: 'user3',
          groupId: 'group1',
        },
        {
          userId: 'user4',
          groupId: 'group1',
        },
        {
          userId: 'user5',
          groupId: 'group1',
        },
      ],
    });
  });

  afterAll(async () => {
    const deleteExpenses = db.expense.deleteMany();
    const deleteGroups = db.group.deleteMany();
    const deleteUsers = db.user.deleteMany();

    await db.$transaction([deleteExpenses, deleteGroups, deleteUsers]);

    await db.$disconnect();
  });

  const ctx = createInnerTRPCContext({
    session: mockSession,
    user: mockUser,
  });
  const caller = createCaller(ctx);

  describe('create', async () => {
    it('should successfully create expense', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'expense1',
        description: 'expense1',
        amount: 100,
        payerId: 'user1',
        debts: [
          {
            settled: 0,
            amount: 100,
            debtorId: 'user2',
          },
        ],
      };

      const result = await caller.expense.create(input);
      expect(result.name).toEqual('expense1');
      expect(result.description).toEqual('expense1');
      expect(result.payerId).toEqual('user1');
      expect(result.debts).toHaveLength(1);
      expect(result.debts[0]?.amount.toNumber()).toEqual(100);
      expect(result.debts[0]?.settled.toNumber()).toEqual(0);
      expect(result.debts[0]?.debtorId).toEqual('user2');
      expect(result.amount.toNumber()).toEqual(100);
    });

    it('should fail when amount is negative', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'expense2',
        description: 'expense2',
        amount: -100,
        payerId: 'user1',
        debts: [
          {
            settled: 0,
            amount: -100,
            debtorId: 'user2',
          },
        ],
      };

      await expect(caller.expense.create(input)).rejects.toThrow();
    });

    it('should fail when debts amount does not match expense amount', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'expense3',
        description: 'expense3',
        amount: 100,
        payerId: 'user1',
        debts: [
          {
            settled: 0,
            amount: 50,
            debtorId: 'user2',
          },
        ],
      };

      await expect(caller.expense.create(input)).rejects.toThrow();
    });

    it('should fail when payer is not in the group', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'expense4',
        description: 'expense4',
        amount: 100,
        payerId: 'nonexistentUser',
        debts: [
          {
            settled: 0,
            amount: 100,
            debtorId: 'user2',
          },
        ],
      };

      await expect(caller.expense.create(input)).rejects.toThrow();
    });

    it('should fail when debtor is not in the group', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'expense5',
        description: 'expense5',
        amount: 100,
        payerId: 'user1',
        debts: [
          {
            settled: 0,
            amount: 100,
            debtorId: 'nonexistentUser',
          },
        ],
      };

      await expect(caller.expense.create(input)).rejects.toThrow();
    });

    it('should create expense with multiple debtors and uneven amounts', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'Group dinner',
        description: 'Restaurant bill split',
        amount: 250,
        payerId: 'user1',
        debts: [
          { settled: 0, amount: 100, debtorId: 'user2' },
          { settled: 0, amount: 75, debtorId: 'user3' },
          { settled: 0, amount: 50, debtorId: 'user4' },
          { settled: 0, amount: 25, debtorId: 'user5' },
        ],
      };

      const result = await caller.expense.create(input);
      expect(result.amount.toNumber()).toEqual(250);
      expect(result.debts).toHaveLength(4);
      expect(result.debts.map((d) => d.amount.toNumber())).toEqual([100, 75, 50, 25]);
    });

    it('should create expense with pre-settled amounts', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'Partially settled bill',
        description: 'Some already paid in cash',
        amount: 300,
        payerId: 'user1',
        debts: [
          { settled: 50, amount: 100, debtorId: 'user2' },
          { settled: 25, amount: 100, debtorId: 'user3' },
          { settled: 0, amount: 100, debtorId: 'user4' },
        ],
      };

      const result = await caller.expense.create(input);
      expect(result.debts).toHaveLength(3);
      expect(result.debts.map((d) => d.settled.toNumber())).toEqual([50, 25, 0]);
    });

    it('should fail when settled amount exceeds debt amount', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'Invalid settlement',
        description: 'Settled more than owed',
        amount: 100,
        payerId: 'user1',
        debts: [{ settled: 120, amount: 100, debtorId: 'user2' }],
      };

      await expect(caller.expense.create(input)).rejects.toThrow();
    });

    it('should fail when the same debtor appears multiple times', async () => {
      const input: inferProcedureInput<AppRouter['expense']['create']> = {
        name: 'Duplicate debtor',
        amount: 200,
        payerId: 'user1',
        debts: [
          { settled: 0, amount: 100, debtorId: 'user2' },
          { settled: 0, amount: 100, debtorId: 'user2' },
        ],
      };

      await expect(caller.expense.create(input)).rejects.toThrow();
    });
  });

  describe('list', async () => {
    it('should return paginated active expenses', async () => {
      const result = await caller.expense.list({
        limit: 10,
        type: 'active',
      });
      expect(Array.isArray(result.items)).toBeTruthy();
    });

    it('should return paginated archived expenses', async () => {
      const result = await caller.expense.list({
        limit: 10,
        type: 'archive',
      });
      expect(Array.isArray(result.items)).toBeTruthy();
    });

    it('should return paginated search', async () => {
      const result = await caller.expense.list({
        limit: 10,
        type: 'search',
        searchText: 'dinner',
      });
      expect(Array.isArray(result.items)).toBeTruthy();
    });
  });

  describe('byId', async () => {
    it('should return expense by id', async () => {
      const created = await caller.expense.create({
        name: 'expense1',
        description: 'expense1',
        amount: 100,
        payerId: 'user1',
        debts: [
          {
            settled: 0,
            amount: 100,
            debtorId: 'user2',
          },
        ],
      });

      const result = await caller.expense.byId({ id: created.id });
      expect(result?.id).toEqual(created.id);
    });
  });

  describe('delete', async () => {
    it('should delete an expense', async () => {
      const created = await caller.expense.create({
        name: 'expense1',
        description: 'expense1',
        amount: 100,
        payerId: 'user1',
        debts: [
          {
            settled: 0,
            amount: 100,
            debtorId: 'user2',
          },
        ],
      });

      const result = await caller.expense.delete({ id: created.id });
      expect(result.id).toEqual(created.id);
    });

    it('should fail when expense has settled debts', async () => {
      const created = await caller.expense.create({
        name: 'expense1',
        description: 'expense1',
        amount: 100,
        payerId: 'user1',
        debts: [
          {
            settled: 50,
            amount: 100,
            debtorId: 'user2',
          },
        ],
      });

      await expect(caller.expense.delete({ id: created.id })).rejects.toThrow();
    });

    it('should fail when expense does not exist', async () => {
      await expect(caller.expense.delete({ id: 'nonexistentId' })).rejects.toThrow();
    });
  });
});
