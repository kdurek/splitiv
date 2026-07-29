import { expenseDebt } from "@repo/db/schema";
import { sql } from "drizzle-orm";

/**
 * Amounts are stored as unbounded `numeric`, and rows migrated from Prisma carry
 * sub-grosz dust (e.g. amount 93.15000000000001 against settled 93.15). Anything
 * below half a grosz is treated as settled so those debts stay out of the lists.
 */
export const openDebt = sql`${expenseDebt.amount} - ${expenseDebt.settled} >= 0.005`;

/** Money comparisons run in grosz so sub-grosz dust can't make a debt unsettleable. */
export function toGrosz(value: string) {
  return Math.round(Number(value) * 100);
}
