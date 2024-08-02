'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useFormState, useFormStatus } from 'react-dom';

import { AuthFormError } from '@/components/auth/auth-form-error';
import { Loader } from '@/components/layout/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpAction } from '@/lib/actions/auth';

export default function SignUpPage() {
  const t = useTranslations('SignUpPage');
  const [state, formAction] = useFormState(signUpAction, {
    error: '',
  });

  return (
    <main className="space-y-6">
      <h1 className="text-center text-2xl font-bold">{t('title')}</h1>
      <AuthFormError state={state} />
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nazwa</Label>
          <Input name="name" id="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">Imię</Label>
          <Input name="firstName" id="firstName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input name="lastName" id="lastName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" id="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input type="password" name="password" id="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
          <Input type="password" name="confirmPassword" id="confirmPassword" required />
        </div>
        <SubmitButton />
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Masz już konto?{' '}
        <Link href="/logowanie" className="text-secondary-foreground underline">
          Zaloguj się
        </Link>
      </div>
    </main>
  );
}

const SubmitButton = () => {
  const t = useTranslations('SignUpButton');
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending && <Loader className="mr-2 size-4 animate-spin" />}
      {t('text')}
    </Button>
  );
};
