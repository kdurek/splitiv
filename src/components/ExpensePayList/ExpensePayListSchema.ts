import { z } from "zod";

export const ExpensePayListSchema = z
  .object({
    debts: z.array(
      z.object({
        id: z.string().cuid2(),
        name: z.string(),
        amount: z.number(),
        check: z.boolean(),
      })
    ),
  })
  .refine((values) => values.debts.filter((debt) => debt.check).length !== 0, {
    message: "Musisz wybrać przynajmniej jeden dług",
    path: ["debts"],
  });

export type ExpensePayListSchemaValues = z.infer<typeof ExpensePayListSchema>;
