import { z } from "zod";

export const RecipeFormSchema = z.object({
  name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
  ingredients: z.array(
    z.object({
      name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
      amount: z.number(),
      unit: z.string(),
    })
  ),
  steps: z.array(
    z.object({
      name: z.string().min(3, { message: "Minimalna długość to 3 znaki" }),
    })
  ),
});

export type RecipeFormValues = z.infer<typeof RecipeFormSchema>;
