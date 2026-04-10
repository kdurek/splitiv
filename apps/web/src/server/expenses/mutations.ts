import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { expense, expenseDebt, userGroup } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";

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
  .handler(async ({ context, data }) => {
    const groupId = context.user.activeGroupId;
    if (!groupId) throw new Error("No active group");

    // Verify debt amounts sum to total
    const debtSum = data.debts.reduce((acc, d) => acc + parseFloat(d.amount), 0).toFixed(2);
    if (debtSum !== parseFloat(data.amount).toFixed(2)) {
      throw new Error("Debt amounts must sum to the total expense amount");
    }

    // Verify all referenced users are members of the active group
    const members = await db
      .select({ userId: userGroup.userId })
      .from(userGroup)
      .where(eq(userGroup.groupId, groupId));
    const memberIds = new Set(members.map((m) => m.userId));

    if (!memberIds.has(data.payerId)) {
      throw new Error("Payer is not a member of the active group");
    }
    for (const debt of data.debts) {
      if (!memberIds.has(debt.debtorId)) {
        throw new Error("Debtor is not a member of the active group");
      }
    }

    const expenseId = ulid();

    await db.transaction(async (tx) => {
      await tx.insert(expense).values({
        id: expenseId,
        name: data.title,
        description: data.description ?? null,
        payerId: data.payerId,
        amount: data.amount,
        groupId,
      });

      await tx.insert(expenseDebt).values(
        data.debts.map((debt) => ({
          id: ulid(),
          expenseId,
          debtorId: debt.debtorId,
          amount: debt.amount,
        })),
      );
    });

    return { expenseId };
  });
