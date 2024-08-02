import { Gender } from '@prisma/client';
import { z } from 'zod';

import { userInfoSchema } from '@/lib/validations/auth';

export const updateUserFormSchema = userInfoSchema;

export const genderSelectFormSchema = z.object({
  gender: z.nativeEnum(Gender, { required_error: 'Musisz wybrać płeć' }),
});
