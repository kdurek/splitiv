import { z } from 'zod';

export const expenseNoteFormSchema = z.object({
  content: z.string().min(3, { message: 'Minimalna długość to 3 znaki' }),
});
