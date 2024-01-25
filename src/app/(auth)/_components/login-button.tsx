'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from '@/app/_components/ui/button';

export function LoginButton() {
  return (
    <Button onClick={() => signIn('google', { callbackUrl: '/' })}>
      <LogIn className="mr-2" /> Zaloguj
    </Button>
  );
}
