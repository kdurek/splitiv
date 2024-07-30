import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { LoginButton } from '@/components/auth/login-button';
import { validateRequest } from '@/server/auth';

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }

  const t = await getTranslations('LoginPage');

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="max-w-md">{t('title')}</h1>
      <LoginButton />
    </div>
  );
}
