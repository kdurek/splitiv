import { z } from "zod";

export const ExpenseFormSchema = z
  .object({
    name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
    description: z
      .union([
        z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
        z.string().length(0),
      ])
      .optional(),
    amount: z.number().gt(0, { message: "Kwota musi być większa niż 0" }),
    payer: z.string().uuid("Musisz wybrać osobę płacącą"),
    method: z.string(),
    single: z.object({
      ower: z.string(),
    }),
    equal: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        check: z.boolean(),
      })
    ),
    unequal: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        amount: z.number(),
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
      if (values.method !== "single") return true;

      return values.single.ower !== "";
    },
    {
      message: "Musisz wybrać osobę pożyczającą",
      path: ["single", "ower"],
    }
  )
  .refine(
    (values) => {
      if (values.method !== "single") return true;
      if (values.method === "single" && values.payer === "") return true;

      return values.single.ower !== values.payer;
    },
    {
      message: "Osoba płacąca nie może być osobą pożyczającą",
      path: ["single"],
    }
  )
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

      return values.unequal.filter((value) => value.amount > 0).length > 1;
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
        (prev, curr) => prev + (curr.amount || 0),
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
