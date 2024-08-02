'use server';

import { redirect } from 'next/navigation';

import { genericError, setAuthCookie, validateSignInFormData, validateSignUpFormData } from '@/lib/auth/utils';
import { hashPassword, verifyPassword } from '@/server/api/services/auth';
import { lucia, validateRequest } from '@/server/auth';
import { db } from '@/server/db';

interface ActionResult {
  error: string;
}

export async function signInAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { data, error } = validateSignInFormData(formData);
    if (error !== null) return { error };

    const existingUser = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!existingUser?.password) {
      return {
        error: 'Nieprawidłowy email lub hasło',
      };
    }

    const validPassword = await verifyPassword(existingUser.password, data.password);
    if (!validPassword) {
      return {
        error: 'Nieprawidłowy email lub hasło',
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    setAuthCookie(sessionCookie);
    return redirect('/');
  } catch (e) {
    return genericError;
  }
}

export async function signUpAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { data, error } = validateSignUpFormData(formData);
    if (error !== null) return { error };

    const hashedPassword = await hashPassword(data.password);
    const existingUser = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (existingUser) {
      return {
        error: 'Użytkownik o podanym adresie email już istnieje',
      };
    }

    const user = await db.user.create({
      data: {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
      },
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    setAuthCookie(sessionCookie);
    return redirect('/');
  } catch (e) {
    return genericError;
  }
}

export async function signOutAction(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  setAuthCookie(sessionCookie);
  return redirect('/logowanie');
}
