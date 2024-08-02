import { type Cookie } from 'lucia';
import { cookies } from 'next/headers';

import {
  type SignInFormSchema,
  signInFormSchema,
  type SignUpFormSchema,
  signUpFormSchema,
} from '@/lib/validations/auth';

export const genericError = { error: 'Wystąpił błąd, spróbuj ponownie' };

export const setAuthCookie = (cookie: Cookie) => {
  cookies().set(cookie.name, cookie.value, cookie.attributes);
};

export const validateSignInFormData = (
  formData: FormData,
): { data: SignInFormSchema; error: null } | { data: null; error: string } => {
  const email = formData.get('email');
  const password = formData.get('password');
  const result = signInFormSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      data: null,
      error: result.error.errors[0]?.message ?? '',
    };
  }

  return { data: result.data, error: null };
};

export const validateSignUpFormData = (
  formData: FormData,
): { data: SignUpFormSchema; error: null } | { data: null; error: string } => {
  const name = formData.get('name');
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const result = signUpFormSchema.safeParse({ name, firstName, lastName, email, password, confirmPassword });

  if (!result.success) {
    return {
      data: null,
      error: result.error.errors[0]?.message ?? '',
    };
  }

  return { data: result.data, error: null };
};
