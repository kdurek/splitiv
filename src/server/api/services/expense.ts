import { TRPCError } from '@trpc/server';
import type { ExpenseCreateInputSchema, ExpenseUpdateInputSchema, ExpenseWhereInputSchema } from 'prisma/generated/zod';

import { db } from '@/server/db';

export const getInfiniteExpenses = async (
  expensesWhere: typeof ExpenseWhereInputSchema._type,
  limit: number,
  cursor?: string | null,
) => {
  const items = await db.expense.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    where: expensesWhere,
    include: {
      group: true,
      payer: true,
      debts: {
        orderBy: {
          debtor: {
            name: 'asc',
          },
        },
        include: {
          debtor: true,
          logs: {
            include: {
              debt: {
                select: {
                  debtor: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return {
    items,
    nextCursor,
  };
};

export const getExpensesBetweenUsers = async (groupId: string, payerId: string, debtorId: string) => {
  const expenses = await db.expense.findMany({
    where: {
      groupId,
      payerId,
      debts: {
        some: {
          debtorId,
          settled: {
            not: {
              equals: db.expenseDebt.fields.amount,
            },
          },
        },
      },
    },
    include: {
      group: true,
      payer: true,
      debts: {
        orderBy: {
          debtor: {
            name: 'asc',
          },
        },
        include: {
          debtor: true,
          logs: {
            include: {
              debt: {
                select: {
                  debtor: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return expenses;
};

export const getExpenseById = async (expenseId?: string) => {
  const expense = await db.expense.findUnique({
    where: {
      id: expenseId,
    },
    include: {
      group: true,
      payer: true,
      debts: {
        orderBy: {
          debtor: {
            name: 'asc',
          },
        },
        include: {
          debtor: true,
          logs: {
            include: {
              debt: {
                include: {
                  debtor: true,
                },
              },
            },
          },
        },
      },
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: true,
        },
      },
    },
  });

  if (!expense) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Nie znaleziono wydatku',
    });
  }

  return expense;
};

export const createExpense = async (expenseData: typeof ExpenseCreateInputSchema._type) => {
  const expense = await db.expense.create({
    data: expenseData,
    include: {
      debts: true,
    },
  });

  return expense;
};

export const updateExpense = async (expenseId: string, expenseData: typeof ExpenseUpdateInputSchema._type) => {
  const expense = await db.expense.update({
    where: {
      id: expenseId,
    },
    data: expenseData,
    include: {
      payer: true,
      group: true,
    },
  });

  return expense;
};

export const deleteExpense = async (expenseId: string) => {
  const expense = await db.expense.delete({
    where: {
      id: expenseId,
    },
    include: {
      payer: true,
      group: true,
    },
  });

  return expense;
};

export const checkExpenseAccess = async (userId: string, expenseId: string) => {
  const expense = await getExpenseById(expenseId);

  if (expense.group.adminId !== userId && expense.payerId !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Nie masz uprawnień do wykonania tej operacji',
    });
  }
};
