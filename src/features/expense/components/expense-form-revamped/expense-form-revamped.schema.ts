import Decimal from "decimal.js";
import { z } from "zod";

export const ExpenseFormSchemaRevamped = z
  .object({
    name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
    description: z
      .union([
        z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
        z.string().length(0),
      ])
      .optional(),
    amount: z
      .number({ required_error: "Musisz wpisać kwotę" })
      .gt(0, { message: "Kwota musi być większa niż zero" }),
    payer: z.string().cuid2("Musisz wybrać osobę płacącą"),
    debts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        amount: z.coerce.number({ required_error: "Musisz wpisać kwotę" }),
      })
    ),
  })
  .refine(
    (values) => {
      const usedAmount = Number(
        values.debts.reduce(
          (prev, curr) => Decimal.add(prev, curr.amount),
          new Decimal(0)
        )
      );
      return values.amount === usedAmount;
    },
    {
      message: "Kwota wydatku nie jest równo rozdzielona pomiędzy użytkowników",
      path: ["debts"],
    }
  );

export type ExpenseFormValuesRevamped = z.infer<
  typeof ExpenseFormSchemaRevamped
>;
