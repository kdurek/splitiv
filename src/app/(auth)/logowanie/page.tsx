'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useFormState, useFormStatus } from 'react-dom';

import { AuthFormError } from '@/components/auth/auth-form-error';
import { Loader } from '@/components/layout/loading';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signInAction } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';

export default function SignInPage() {
  const t = useTranslations('SignInPage');
  const [state, formAction] = useFormState(signInAction, {
    error: '',
  });

  return (
    <main className="space-y-6">
      <h1 className="text-center text-2xl font-bold">{t('title')}</h1>
      <AuthFormError state={state} />
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" id="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input type="password" name="password" id="password" required />
        </div>
        <SubmitButton />
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Nie masz jeszcze konta?{' '}
        <Link href="/rejestracja" className="text-accent-foreground underline hover:text-primary">
          Zarejestruj się
        </Link>
      </div>
      <Separator />
      <GoogleSignInButton />
    </main>
  );
}

const SubmitButton = () => {
  const t = useTranslations('SignInButton');
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending && <Loader className="mr-2 size-4 animate-spin" />}
      {t('text')}
    </Button>
  );
};

function GoogleSignInButton() {
  const t = useTranslations('GoogleSignInButton');

  return (
    <Link href="/api/auth/google" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
      {t('text')}
    </Link>
  );
}
