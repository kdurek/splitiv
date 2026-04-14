import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createExpenseHandler,
  deleteExpenseHandler,
  settleDebtHandler,
  settleDebtsHandler,
  undoDebtLogHandler,
} from "./handlers";

export const $createExpense = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      payerId: z.string().min(1),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
      debts: z
        .array(
          z.object({
            debtorId: z.string().min(1),
            amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
          }),
        )
        .min(1),
    }),
  )
  .handler(({ context, data }) => createExpenseHandler(db, context.user, data));

export const $settleDebt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      debtId: z.string().min(1),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    }),
  )
  .handler(({ context, data }) => settleDebtHandler(db, context.user, data));

export const $undoDebtLog = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ logId: z.string().min(1) }))
  .handler(({ context, data }) => undoDebtLogHandler(db, context.user, data));

export const $settleDebts = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      debts: z
        .array(
          z.object({
            debtId: z.string().min(1),
            amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
          }),
        )
        .min(1),
    }),
  )
  .handler(({ context, data }) => settleDebtsHandler(db, context.user, data));

export const $deleteExpense = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ expenseId: z.string().min(1) }))
  .handler(({ context, data }) => deleteExpenseHandler(db, context.user, data));
