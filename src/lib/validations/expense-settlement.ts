import { z } from 'zod';

export const expenseSettlementFormSchema = z.object({
  credits: z.array(
    z.object({
      id: z.string(),
      selected: z.boolean(),
    }),
  ),
  debts: z.array(
    z.object({
      id: z.string(),
      selected: z.boolean(),
    }),
  ),
});
