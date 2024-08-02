'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Loader } from '@/components/layout/loading';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/actions/auth';

export function SignOutButton() {
  const t = useTranslations('LogoutButton');
  const { pending } = useFormStatus();

  return (
    <form action={signOutAction}>
      <Button type="submit" variant="destructive" className="w-full" disabled={pending}>
        {pending && <Loader className="mr-2 size-4 animate-spin" />}
        <LogOut className="mr-2" /> {t('text')}
      </Button>
    </form>
  );
}
