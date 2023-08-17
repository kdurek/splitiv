import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const expenseRouter = createTRPCRouter({
  getInfinite: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        name: z.string().optional(),
        description: z.string().optional(),
        payerId: z.string().optional(),
        debtorId: z.string().optional(),
        isSettled: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const items = await ctx.prisma.expense.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          groupId: ctx.session.activeGroupId,
          OR: [
            {
              name: {
                contains: input.name || "",
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: input.description || "",
                mode: "insensitive",
              },
            },
          ],
          payerId: input.payerId || undefined,
          debts: {
            some: {
              debtorId: input.debtorId || undefined,
              settled: {
                lt:
                  input.isSettled === false
                    ? ctx.prisma.expenseDebt.fields.amount
                    : undefined,
                equals:
                  input.isSettled === true
                    ? ctx.prisma.expenseDebt.fields.amount
                    : undefined,
              },
            },
          },
        },
        include: {
          payer: true,
          debts: {
            orderBy: {
              debtorId: "desc",
            },
            include: {
              expense: {
                select: {
                  payerId: true,
                },
              },
              debtor: true,
            },
          },
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

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        payerId: z.string().optional(),
        debtorId: z.string().optional(),
        isSettled: z.boolean().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.prisma.expense.findMany({
        take: input.limit || undefined,
        where: {
          groupId: ctx.session.activeGroupId,
          OR: [
            {
              name: {
                contains: input.name || "",
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: input.description || "",
                mode: "insensitive",
              },
            },
          ],
          payerId: input.payerId || undefined,
          debts: {
            some: {
              debtorId: input.debtorId || undefined,
              settled: {
                lt:
                  input.isSettled === false
                    ? ctx.prisma.expenseDebt.fields.amount
                    : undefined,
                equals:
                  input.isSettled === true
                    ? ctx.prisma.expenseDebt.fields.amount
                    : undefined,
              },
            },
          },
        },
        include: {
          payer: true,
          debts: {
            orderBy: {
              debtorId: "desc",
            },
            include: {
              expense: {
                select: {
                  payerId: true,
                },
              },
              debtor: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z
          .union([
            z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
            z.string().length(0),
          ])
          .optional(),
        payerId: z.string(),
        amount: z.number(),
        debts: z.array(
          z.object({
            amount: z.number(),
            debtorId: z.string(),
            settled: z.number().default(0),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.create({
        data: {
          group: {
            connect: {
              id: ctx.session.activeGroupId,
            },
          },
          name: input.name,
          description: input.description ?? null,
          amount: input.amount,
          payer: {
            connect: {
              id: input.payerId,
            },
          },
          debts: {
            createMany: { data: input.debts },
          },
        },
        include: {
          debts: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        name: z.string(),
        payerId: z.string(),
        amount: z.number(),
        debts: z.array(
          z.object({
            amount: z.number(),
            debtorId: z.string(),
            settled: z.number().default(0),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.update({
        where: {
          id: input.expenseId,
        },
        data: {
          name: input.name,
          amount: input.amount,
          debts: {
            deleteMany: {
              expenseId: input.expenseId,
            },
            createMany: {
              data: input.debts,
            },
          },
        },
      });
    }),

  updateDebt: protectedProcedure
    .input(
      z.object({
        expenseDebtId: z.string(),
        settled: z.number().default(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const expenseDebt = await ctx.prisma.expenseDebt.findUniqueOrThrow({
        where: {
          id: input.expenseDebtId,
        },
        select: {
          amount: true,
          debtorId: true,
          expense: {
            select: {
              payerId: true,
            },
          },
        },
      });

      if (
        ctx.session.user.id !== expenseDebt.debtorId &&
        ctx.session.user.id !== expenseDebt.expense.payerId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tylko osoba płacąca i oddająca dług może go edytować",
        });
      }

      if (input.settled > Number(expenseDebt.amount)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kwota do oddania nie może być większa niż kwota do zapłaty",
        });
      }

      if (expenseDebt?.expense.payerId === expenseDebt.debtorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nie można edytować kwoty do oddania osoby płacącej",
        });
      }

      return ctx.prisma.expenseDebt.update({
        where: {
          id: input.expenseDebtId,
        },
        data: {
          settled: input.settled,
        },
      });
    }),

  settleDebts: protectedProcedure
    .input(
      z.object({
        expenseDebts: z.array(
          z.object({
            id: z.string().cuid2(),
            settled: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await Promise.all(
          input.expenseDebts.map((expenseDebt) =>
            tx.expenseDebt.update({
              where: {
                id: expenseDebt.id,
              },
              data: {
                settled: expenseDebt.settled,
              },
            }),
          ),
        );
      });
    }),

  delete: protectedProcedure
    .input(z.object({ expenseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.expense.delete({
        where: {
          id: input.expenseId,
        },
      });
    }),
});
