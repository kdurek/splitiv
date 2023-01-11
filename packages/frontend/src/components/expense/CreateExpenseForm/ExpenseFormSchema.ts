import { z } from "zod";

export const ExpenseFormSchema = z
  .object({
    name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
    amount: z.number().gt(0, { message: "Minimalna wartość to 0.01" }),
    payer: z.string(),
    method: z.string(),
    equal: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        check: z.boolean(),
        paid: z.string(),
        owed: z.string(),
        userId: z.string(),
      })
    ),
    unequal: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        owed: z.number(),
      })
    ),
    ratio: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        ratio: z.number(),
      })
    ),
  })
  .refine(
    (values) => {
      if (values.method !== "equal") return true;

      return values.equal.filter((value) => value.check).length > 1;
    },
    {
      message: "Co najmniej 2 osoby muszą uczestniczyć w wydatku",
      path: ["equal"],
    }
  )
  .refine(
    (values) => {
      if (values.method !== "unequal") return true;

      return values.unequal.filter((value) => value.owed > 0).length > 1;
    },
    {
      message: "Co najmniej 2 osoby muszą uczestniczyć w wydatku",
      path: ["unequal"],
    }
  )
  .refine(
    (values) => {
      if (values.method !== "unequal") return true;

      const usedAmount = values.unequal.reduce(
        (prev, curr) => prev + (curr.owed || 0),
        0
      );
      return values.amount === usedAmount;
    },
    {
      message: "Kwota wydatku nie jest równo rozdzielona pomiędzy użytkowników",
      path: ["unequal"],
    }
  )
  .refine(
    (values) => {
      if (values.method !== "ratio") return true;

      return values.ratio.filter((value) => value.ratio > 0).length > 1;
    },
    {
      message: "Co najmniej 2 osoby muszą uczestniczyć w wydatku",
      path: ["ratio"],
    }
  );

export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;
