import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

export const expenseFormSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Minimalna długość to 3 znaki' })
      .max(30, { message: 'Maksymalna długość to 30 znaków' }),
    description: z
      .union([z.string().min(3, { message: 'Minimalna długość to 3 znaki' }), z.string().length(0)])
      .optional(),
    amount: z
      .number({ required_error: 'Musisz wpisać kwotę' })
      .positive({ message: 'Kwota musi być większa niż zero' }),
    payer: z.string().cuid2({ message: 'Musisz wybrać osobę płacącą' }),
    debts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        amount: z.number({ required_error: 'Musisz wpisać kwotę' }),
      }),
    ),
  })
  .refine(
    (values) => {
      const usedAmount = Number(values.debts.reduce((prev, curr) => Decimal.add(prev, curr.amount), new Decimal(0)));
      return values.amount === usedAmount;
    },
    {
      message: 'Kwota wydatku nie jest równo rozdzielona pomiędzy użytkowników',
      path: ['debts'],
    },
  )
  .refine(
    (values) => {
      if (values.debts.find((v) => v.id === values.payer)?.amount === values.amount) {
        return false;
      }
      return true;
    },
    {
      message: 'Kwota wydatku nie może być całkowicie przypisana do osoby płacącej',
      path: ['debts'],
    },
  );
