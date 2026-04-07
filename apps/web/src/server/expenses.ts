import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";

export const $getExpenses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const expenses = await db.query.expense.findMany({
      limit: 5,
      orderBy: (expense, { desc }) => [desc(expense.createdAt)],
      with: {
        payer: { columns: { name: true } },
      },
    });
    return expenses;
  });
