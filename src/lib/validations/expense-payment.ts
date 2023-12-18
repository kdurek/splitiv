import { z } from 'zod';

export const expensePaymentFormSchema = z.object({
  amount: z.number({ required_error: 'Musisz wpisać kwotę' }).positive({ message: 'Kwota musi być większa niż zero' }),
});
