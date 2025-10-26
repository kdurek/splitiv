import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "@splitiv/api";
import prisma from "@splitiv/db";
import Decimal from "decimal.js";
import { z } from "zod";

export const expenseDebtRouter = {
  getBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.cuid(),
      })
    )
    .handler(async ({ input, context }) => {
      const debts = await prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: context.user.activeGroupId,
            payerId: input.userId,
          },
          debtorId: context.user.id,
          settled: {
            lt: prisma.expenseDebt.fields.amount,
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
            createdAt: "desc",
          },
        },
      });

      const credits = await prisma.expenseDebt.findMany({
        where: {
          expense: {
            groupId: context.user.activeGroupId,
            payerId: context.user.id,
          },
          debtorId: input.userId,
          settled: {
            lt: prisma.expenseDebt.fields.amount,
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
            createdAt: "desc",
          },
        },
      });

      return {
        debts,
        credits,
      };
    }),

  settleByAmount: protectedProcedure
    .input(
      z.object({
        debtId: z.cuid(),
        amount: z.number(),
      })
    )
    .handler(
      async ({ input }) =>
        await prisma.$transaction(async (tx) => {
          const debt = await tx.expenseDebt.findUnique({
            where: {
              id: input.debtId,
            },
          });

          if (!debt) {
            throw new ORPCError("NOT_FOUND", {
              message: "Nie znaleziono długu",
            });
          }

          if (debt.settled.equals(debt.amount)) {
            throw new ORPCError("BAD_REQUEST", {
              message: "Dług jest już spłacony",
            });
          }

          if (
            Decimal.add(input.amount, debt.settled).greaterThan(debt.amount)
          ) {
            throw new ORPCError("BAD_REQUEST", {
              message:
                "Kwota do oddania nie może być większa niż kwota do zapłaty",
            });
          }

          await tx.expenseLog.create({
            data: {
              debtId: input.debtId,
              amount: input.amount,
            },
          });

          return tx.expenseDebt.update({
            where: {
              id: input.debtId,
            },
            data: {
              settled: Decimal.add(input.amount, debt.settled),
            },
          });
        })
    ),

  settleBetweenUser: protectedProcedure
    .input(
      z.object({
        userId: z.cuid(),
      })
    )
    .handler(
      async ({ input, context }) =>
        await prisma.$transaction(async (tx) => {
          const debts = await tx.expenseDebt.findMany({
            where: {
              expense: {
                groupId: context.user.activeGroupId,
              },
              OR: [
                {
                  expense: {
                    payerId: context.user.id,
                  },
                  debtorId: input.userId,
                  settled: {
                    not: {
                      equals: prisma.expenseDebt.fields.amount,
                    },
                  },
                },
                {
                  expense: {
                    payerId: input.userId,
                  },
                  debtorId: context.user.id,
                  settled: {
                    not: {
                      equals: prisma.expenseDebt.fields.amount,
                    },
                  },
                },
              ],
            },
            select: {
              id: true,
              amount: true,
              settled: true,
            },
          });

          if (debts.length === 0) {
            throw new ORPCError("BAD_REQUEST", {
              message: "Nie ma długów do rozliczenia",
            });
          }

          await Promise.all(
            debts.map(async (debt) => {
              if (debt.settled.equals(debt.amount)) {
                throw new ORPCError("BAD_REQUEST", {
                  message: "Dług jest już spłacony",
                });
              }

              await tx.expenseDebt.update({
                where: {
                  id: debt.id,
                },
                data: {
                  settled: debt.amount,
                },
              });

              await tx.expenseLog.create({
                data: {
                  debtId: debt.id,
                  amount: Decimal.sub(debt.amount, debt.settled),
                },
              });
            })
          );

          return debts;
        })
    ),
};
