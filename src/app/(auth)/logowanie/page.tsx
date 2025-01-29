import Link from 'next/link';

import { SignInForm } from '@/app/(auth)/logowanie/form';
import { GoogleSignInButton } from '@/app/(auth)/logowanie/google';

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <SignInForm />
      <GoogleSignInButton />
      <div className="text-center text-sm text-muted-foreground">
        Nie masz jeszcze konta?{' '}
        <Link href="/rejestracja" className="text-accent-foreground underline hover:text-primary">
          Zarejestruj się
        </Link>
      </div>
    </div>
  );
}
