import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";
import { protectedProcedure } from "@splitiv/api";
import type { User } from "@splitiv/auth";
import prisma from "@splitiv/db";
import Decimal from "decimal.js";
import { z } from "zod";

const checkExpenseLogAccess = os
  .$context<{ user: User }>()
  .middleware(async ({ context, next }, input: { id: string }) => {
    const expenseLog = await prisma.expenseLog.findUnique({
      where: {
        id: input.id,
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
      throw new ORPCError("NOT_FOUND", {
        message: "Nie znaleziono logu wydatku",
      });
    }

    if (
      expenseLog.debt.expense.group.adminId !== context.user?.id &&
      expenseLog.debt.expense.payerId !== context.user?.id
    ) {
      throw new ORPCError("FORBIDDEN", {
        message: "Nie masz uprawnień do wykonania tej operacji",
      });
    }

    return next();
  });

export const expenseLogRouter = {
  getByExpenseId: protectedProcedure
    .input(z.object({ expenseId: z.string() }))
    .handler(async ({ input }) => {
      const logs = await prisma.expenseLog.findMany({
        where: {
          debt: {
            expenseId: input.expenseId,
          },
        },
        include: {
          debt: {
            include: {
              debtor: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return logs;
    }),

  revert: protectedProcedure
    .input(
      z.object({
        id: z.cuid(),
      })
    )
    .use(checkExpenseLogAccess)
    .handler(
      async ({ input }) =>
        await prisma.$transaction(async (tx) => {
          const expenseLog = await tx.expenseLog.findUnique({
            where: {
              id: input.id,
            },
          });

          if (!expenseLog) {
            throw new ORPCError("NOT_FOUND", {
              message: "Nie znaleziono logu wydatku",
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
            throw new ORPCError("NOT_FOUND", {
              message: "Nie znaleziono długu",
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
              id: input.id,
            },
          });

          return expenseLog;
        })
    ),
};
