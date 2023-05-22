import { z } from "zod";

export const expensePayListSchema = z
  .object({
    debts: z
      .array(
        z.object({
          id: z.string().cuid2(),
          name: z.string(),
          settled: z.number(),
          amount: z.number(),
          check: z.boolean(),
        })
      )
      .optional(),
  })
  .refine((values) => values.debts?.filter((debt) => debt.check).length !== 0, {
    message: "Musisz wybrać przynajmniej jeden dług",
    path: ["debts"],
  });

export type ExpensePayListSchema = z.infer<typeof expensePayListSchema>;
