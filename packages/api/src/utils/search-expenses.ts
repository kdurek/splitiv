import prisma from "@splitiv/db";
import type Decimal from "decimal.js";
import removeAccents from "remove-accents";

interface SearchExpenseResult {
  id: string;
  name: string;
  description: string | null;
  amount: Decimal;
  createdAt: Date;
}

export const searchExpenses = async (groupId: string, query: string) => {
  const searchPattern = `%${removeAccents(query).toLowerCase()}%`;
  const searchResults = await prisma.$queryRaw<SearchExpenseResult[]>`
          SELECT id, name, description, amount, "createdAt"
          FROM "Expense"
          WHERE "groupId" = ${groupId}
            AND (
              unaccent(lower(name)) LIKE ${searchPattern}
              OR unaccent(lower(COALESCE(description, ''))) LIKE ${searchPattern}
            )
          ORDER BY "createdAt" DESC
        `;
  return searchResults;
};
