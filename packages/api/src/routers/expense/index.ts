import { ORPCError, os } from "@orpc/server";
import { protectedProcedure } from "@splitiv/api";
import type { User } from "@splitiv/auth";
import prisma from "@splitiv/db";
import type { ExpenseWhereInput } from "@splitiv/db/prisma/generated/models";
import { searchExpenses } from "@splitiv/db/prisma/generated/sql";
import Decimal from "decimal.js";
import removeAccents from "remove-accents";
import { z } from "zod";
import { sendPush } from "../../utils/push-subscription";
import { expenseDebtRouter } from "./debt";
import { expenseLogRouter } from "./log";

const checkGroupAccess = os
  .$context<{ user: User }>()
  .middleware(async ({ context, next }) => {
    const group = await prisma.group.count({
      where: {
        id: context.user.activeGroupId,
        members: {
          some: {
            userId: context.user.id,
          },
        },
      },
    });

    if (!group) {
      throw new ORPCError("FORBIDDEN", {
        message: "Nie masz uprawnień do wykonania tej operacji",
      });
    }

    return next();
  });

const checkExpenseAccess = os
  .$context<{ user: User }>()
  .middleware(async ({ context, next }, input: { id: string }) => {
    const expense = await prisma.expense.findUnique({
      where: {
        id: input.id,
      },
      include: {
        group: true,
      },
    });

    if (!expense) {
      throw new ORPCError("NOT_FOUND", {
        message: "Nie znaleziono wydatku",
      });
    }

    if (
      expense.group.adminId !== context.user.id &&
      expense.payerId !== context.user.id
    ) {
      throw new ORPCError("FORBIDDEN", {
        message: "Nie masz uprawnień do wykonania tej operacji",
      });
    }

    return next();
  });

export const expenseRouter = {
  debt: expenseDebtRouter,
  log: expenseLogRouter,

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        status: z.enum(["active", "archive"]),
        query: z.string().optional(),
        payerIds: z.string().array().optional(),
        debtorIds: z.string().array().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const baseWhere: ExpenseWhereInput =
        input.status === "active"
          ? {
              OR: [
                {
                  payerId:
                    input.payerIds && input.payerIds.length > 0
                      ? {
                          in: input.payerIds,
                        }
                      : {},
                  debts: {
                    some: {
                      debtorId:
                        input.debtorIds && input.debtorIds.length > 0
                          ? {
                              in: input.debtorIds,
                            }
                          : {},
                      settled: {
                        not: {
                          equals: prisma.expenseDebt.fields.amount,
                        },
                      },
                    },
                  },
                },
                {
                  payerId:
                    input.payerIds && input.payerIds.length > 0
                      ? {
                          in: input.payerIds,
                        }
                      : {},
                  debts: {
                    some: {
                      debtorId:
                        input.debtorIds && input.debtorIds.length > 0
                          ? {
                              in: input.debtorIds,
                            }
                          : {},
                      settled: {
                        lt: prisma.expenseDebt.fields.amount,
                      },
                    },
                  },
                },
              ],
            }
          : {
              OR: [
                {
                  payerId:
                    input.payerIds && input.payerIds.length > 0
                      ? {
                          in: input.payerIds,
                        }
                      : {},
                  debts: {
                    some: {
                      debtorId:
                        input.debtorIds && input.debtorIds.length > 0
                          ? {
                              in: input.debtorIds,
                            }
                          : {},
                    },
                    every: {
                      settled: {
                        equals: prisma.expenseDebt.fields.amount,
                      },
                    },
                  },
                },
              ],
            };

      let queryWhere: ExpenseWhereInput = {};

      if (input.query) {
        const searchPattern = `%${removeAccents(input.query).toLowerCase()}%`;
        const searchResults = await prisma.$queryRawTyped(
          searchExpenses(context.user.activeGroupId, searchPattern)
        );
        const matchingIds = searchResults.map((r) => r.id);

        if (matchingIds.length === 0) {
          return { items: [], nextCursor: undefined };
        }

        queryWhere = { id: { in: matchingIds } };
      }

      const items = await prisma.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          groupId: context.user.activeGroupId,
          AND: [baseWhere, queryWhere],
        },
        select: {
          id: true,
          name: true,
          description: true,
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof input.cursor | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getExpensesBetweenUser: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        userId: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      const items = await prisma.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          groupId: context.user.activeGroupId,
          OR: [
            {
              payerId: context.user.id,
              debts: {
                some: {
                  debtorId: input.userId,
                  settled: {
                    not: {
                      equals: prisma.expenseDebt.fields.amount,
                    },
                  },
                },
              },
            },
            {
              payerId: input.userId,
              debts: {
                some: {
                  debtorId: context.user.id,
                  settled: {
                    not: {
                      equals: prisma.expenseDebt.fields.amount,
                    },
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof input.cursor | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const expense = await prisma.expense.findUnique({
        where: {
          id: input.id,
        },
        include: {
          group: true,
          payer: true,
          debts: {
            orderBy: {
              debtor: {
                name: "asc",
              },
            },
            include: {
              debtor: true,
            },
          },
        },
      });

      return expense;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        amount: z.number(),
        payerId: z.string(),
        debts: z.array(
          z.object({
            settled: z.number(),
            amount: z.number(),
            debtorId: z.string(),
          })
        ),
      })
    )
    .use(checkGroupAccess)
    .handler(async ({ input, context }) => {
      const debtsAmount = input.debts.reduce(
        (acc, debt) => acc.plus(debt.amount),
        new Decimal(0)
      );
      if (debtsAmount.minus(input.amount).abs().greaterThan(0)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Suma długów nie zgadza się z kwotą wydatku",
        });
      }

      if (input.debts.some((debt) => debt.settled > debt.amount)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Kwota spłaty nie może przekroczyć kwoty długu",
        });
      }

      if (
        input.debts.length !==
        new Set(input.debts.map((debt) => debt.debtorId)).size
      ) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Ten sam dłużnik nie może wystąpić więcej niż raz",
        });
      }

      const expense = await prisma.expense.create({
        data: {
          name: input.name,
          description: input.description,
          amount: input.amount,
          payerId: input.payerId,
          debts: {
            createMany: {
              data: input.debts,
            },
          },
          groupId: context.user.activeGroupId,
        },
        include: {
          debts: true,
        },
      });

      const userIdsToPush = [
        ...expense.debts.map((debtor) => debtor.debtorId),
        expense.payerId,
      ].filter((userId) => userId !== context.user.id);

      await sendPush(
        userIdsToPush,
        "Nowy wydatek",
        expense.name,
        `/expenses/${expense.id}`
      );

      return expense;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .use(checkExpenseAccess)
    .handler(async ({ input }) => {
      const expenseToDelete = await prisma.expense.findUnique({
        where: {
          id: input.id,
        },
        select: {
          payerId: true,
        },
      });

      if (!expenseToDelete) {
        throw new ORPCError("NOT_FOUND", {
          message: "Nie znaleziono wydatku",
        });
      }

      const settledDebts = await prisma.expenseDebt.count({
        where: {
          expenseId: input.id,
          debtorId: {
            not: {
              equals: expenseToDelete.payerId,
            },
          },
          settled: {
            not: {
              equals: 0,
            },
          },
        },
      });
      if (settledDebts) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Nie można usunąć wydatku z rozliczonymi długami",
        });
      }

      const expense = await prisma.expense.delete({
        where: {
          id: input.id,
        },
        include: {
          payer: true,
          group: true,
        },
      });
      return expense;
    }),

  getBalances: protectedProcedure.handler(async ({ context }) => {
    const usersInGroup = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        groups: {
          some: {
            groupId: context.user.activeGroupId,
          },
        },
        id: {
          not: context.user.id,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const debtRecords = await prisma.expenseDebt.findMany({
      where: {
        expense: {
          groupId: context.user.activeGroupId,
        },
        settled: { lt: prisma.expenseDebt.fields.amount },
        OR: [
          {
            expense: {
              payerId: context.user.id,
            },
            debtorId: { not: context.user.id },
          },
          {
            debtorId: context.user.id,
            expense: {
              payerId: { not: context.user.id },
            },
          },
        ],
      },
      select: {
        debtorId: true,
        amount: true,
        settled: true,
        expense: {
          select: {
            payerId: true,
          },
        },
      },
    });

    const debtsByDebtor = new Map<string, Decimal>();
    const creditsByPayer = new Map<string, Decimal>();

    for (const record of debtRecords) {
      const delta = record.amount.minus(record.settled);

      const currentDebtorTotal =
        debtsByDebtor.get(record.debtorId) ?? new Decimal(0);
      debtsByDebtor.set(record.debtorId, currentDebtorTotal.plus(delta));

      const currentPayerTotal =
        creditsByPayer.get(record.expense.payerId) ?? new Decimal(0);
      creditsByPayer.set(record.expense.payerId, currentPayerTotal.plus(delta));
    }

    const result = usersInGroup
      .map((user) => ({
        user,
        debts: debtsByDebtor.get(user.id) ?? new Decimal(0),
        credits: creditsByPayer.get(user.id) ?? new Decimal(0),
      }))
      .filter(({ debts, credits }) => !(debts.equals(0) && credits.equals(0)));

    return result;
  }),

  getBalanceBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.cuid(),
      })
    )
    .handler(async ({ input, context }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new ORPCError("NOT_FOUND", {
          message: "Nie znaleziono użytkownika",
        });
      }

      const debtRecords = await prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: context.user.activeGroupId,
          },
          settled: { lt: prisma.expenseDebt.fields.amount },
          OR: [
            {
              expense: {
                payerId: context.user.id,
              },
              debtorId: input.userId,
            },
            {
              expense: {
                payerId: input.userId,
              },
              debtorId: context.user.id,
            },
          ],
        },
        select: {
          debtorId: true,
          amount: true,
          settled: true,
          expense: {
            select: {
              payerId: true,
            },
          },
        },
      });

      let debts = new Decimal(0);
      let credits = new Decimal(0);

      for (const record of debtRecords) {
        const delta = record.amount.minus(record.settled);

        if (record.expense.payerId === context.user.id) {
          debts = debts.plus(delta);
        } else {
          credits = credits.plus(delta);
        }
      }

      const result = {
        user,
        debts,
        credits,
      };

      return result;
    }),
};
