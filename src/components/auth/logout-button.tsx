import { LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { lucia, validateRequest } from '@/server/auth';

async function logout(): Promise<ActionResult> {
  'use server';
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect('/logowanie');
}

interface ActionResult {
  error: string | null;
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="outline" className="w-full">
        <LogOut className="mr-2" /> Wyloguj
      </Button>
    </form>
  );
}
