import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(6, {
    message: 'Hasło musi zawierać minimalnie 6 znaków',
  })
  .max(32, {
    message: 'Hasło może zawierać maksymalnie 32 znaki',
  });

export const userInfoSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Nazwa musi zawierać minimalnie 2 znaki',
    })
    .max(32, {
      message: 'Nazwa może zawierać maksymalnie 32 znaki',
    }),
  firstName: z
    .string()
    .min(2, {
      message: 'Imię musi zawierać minimalnie 2 znaki',
    })
    .max(32, {
      message: 'Imię może zawierać maksymalnie 32 znaki',
    })
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(2, {
      message: 'Nazwisko musi zawierać minimalnie 2 znaki',
    })
    .max(32, {
      message: 'Nazwisko może zawierać maksymalnie 32 znaki',
    })
    .optional()
    .or(z.literal('')),
});

export const signInFormSchema = z.object({
  email: z.string().email({
    message: 'Nieprawidłowy email',
  }),
  password: passwordSchema,
});

export const signUpFormSchema = userInfoSchema
  .extend({
    email: z.string().email().min(5).max(64),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: 'Hasła muszą być takie same',
      path: ['confirmPassword'],
    },
  );

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: 'Hasła muszą być takie same',
      path: ['confirmPassword'],
    },
  );
