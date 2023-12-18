import { Gender } from '@prisma/client';
import { z } from 'zod';

export const updateUserFormSchema = z.object({
  name: z
    .string({ required_error: 'Musisz podać imię i nazwisko' })
    .min(3, 'Minimalna długość to 3 znaki')
    .refine((value) => value.split(' ').length === 2, { message: 'Musisz podać imię i nazwisko' }),
});

export const genderSelectFormSchema = z.object({
  gender: z.nativeEnum(Gender, { required_error: 'Musisz wybrać płeć' }),
});
