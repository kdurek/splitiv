import { toUnit } from "dinero.js";

import { generateBalances } from "../utils/generateBalances";
import { generateDebts } from "../utils/generateDebts";

import type { FastifyRequest } from "fastify";

export async function getGroupsByMe(request: FastifyRequest) {
  return request.server.prisma.group.findMany({
    where: { members: { some: { userId: request.user.id } } },
  });
}

interface IGetGroupById {
  Params: {
    groupId: string;
  };
}

export async function getGroupById(request: FastifyRequest<IGetGroupById>) {
  const { groupId } = request.params;

  const group = await request.server.prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        select: { user: true },
      },
    },
  });

  if (!group) return null;

  const expenseUsers = await request.server.prisma.expenseUsers.findMany({
    where: {
      expense: {
        groupId,
      },
    },
  });

  const membersWithBalances = group.members.map((member) => {
    const generatedBalances = generateBalances(expenseUsers);

    const findBalance = (userId: string) => {
      const foundBalance = generatedBalances.find(
        (balance) => balance.userId === userId
      );
      if (!foundBalance) return "0.00";
      return toUnit(foundBalance.amount).toFixed(2);
    };

    return { ...member.user, balance: findBalance(member.user.id) };
  });

  const debts = generateDebts(expenseUsers);

  return { ...group, members: membersWithBalances, debts };
}

interface ICreateGroup {
  Body: { name: string };
}

export async function createGroup(request: FastifyRequest<ICreateGroup>) {
  const { name } = request.body;

  return request.server.prisma.group.create({
    data: {
      name,
      adminId: request.user.id,
      members: {
        create: [
          {
            userId: request.user.id,
          },
        ],
      },
    },
  });
}

interface IDeleteGroupById {
  Params: {
    groupId: string;
  };
}

export async function deleteGroupById(
  request: FastifyRequest<IDeleteGroupById>
) {
  const { groupId } = request.params;

  return request.server.prisma.group.delete({
    where: { id: groupId },
  });
}

interface IAddUserToGroup {
  Params: {
    groupId: string;
  };
  Body: {
    userId: string;
  };
}

export async function addUserToGroup(request: FastifyRequest<IAddUserToGroup>) {
  const { groupId } = request.params;
  const { userId } = request.body;

  return request.server.prisma.userGroups.create({
    data: {
      groupId,
      userId,
    },
  });
}

interface IDeleteUserFromGroup {
  Params: {
    groupId: string;
  };
  Body: {
    userId: string;
  };
}

export async function deleteUserFromGroup(
  request: FastifyRequest<IDeleteUserFromGroup>
) {
  const { groupId } = request.params;
  const { userId } = request.body;

  return request.server.prisma.userGroups.delete({
    where: {
      userId_groupId: {
        groupId,
        userId,
      },
    },
  });
}

interface IGetExpensesByGroup {
  Params: {
    groupId: string;
  };
}

export async function getExpensesByGroup(
  request: FastifyRequest<IGetExpensesByGroup>
) {
  const { groupId } = request.params;

  const expenses = await request.server.prisma.expense.findMany({
    where: {
      groupId,
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return expenses.map((expense) => {
    const repayments = generateDebts(expense.users);
    return {
      ...expense,
      repayments,
    };
  });
}

interface ICreateExpense {
  Params: {
    groupId: string;
  };
  Body: {
    name: string;
    amount: string;
    users: {
      userId: string;
      owed: string;
      paid: string;
    }[];
    type: string;
  };
}

export async function createExpense(request: FastifyRequest<ICreateExpense>) {
  const { groupId } = request.params;
  const { name, amount, users, type } = request.body;

  return request.server.prisma.expense.create({
    data: {
      group: {
        connect: {
          id: groupId,
        },
      },
      name,
      amount,
      users: {
        create: users,
      },
      type: type ?? "expense",
    },
    include: {
      users: true,
    },
  });
}

interface IDeleteExpense {
  Params: {
    expenseId: string;
  };
}

export async function deleteExpense(request: FastifyRequest<IDeleteExpense>) {
  const { expenseId } = request.params;

  return request.server.prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });
}
