import { z } from 'zod';

export const expenseSettlementFormSchema = z.object({
  debts: z.array(
    z.object({
      id: z.string(),
      selected: z.boolean(),
      name: z.string(),
      amount: z.number(),
      settled: z.number(),
      payerId: z.string(),
      payerName: z.string().nullable(),
      debtorId: z.string(),
      debtorName: z.string().nullable(),
    }),
  ),
});
