import Link from 'next/link';

import { SignUpForm } from '@/app/(auth)/rejestracja/form';

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <SignUpForm />
      <div className="text-center text-sm text-muted-foreground">
        Masz już konto?{' '}
        <Link href="/logowanie" className="text-secondary-foreground underline">
          Zaloguj się
        </Link>
      </div>
    </div>
  );
}
