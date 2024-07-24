import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export async function LoginButton() {
  const t = await getTranslations('LoginButton');

  return (
    <Link href="/api/auth/google" className={cn(buttonVariants(), 'w-full')}>
      <LogIn className="mr-2" /> {t('text')}
    </Link>
  );
}
