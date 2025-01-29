'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Loader } from '@/components/layout/loading';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth';

export function SignOutButton() {
  const t = useTranslations('LogoutButton');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          router.push('/logowanie');
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message);
        },
      },
    });
  };

  return (
    <Button onClick={handleSignOut} variant="destructive" className="w-full" disabled={isLoading}>
      {isLoading && <Loader className="mr-2 size-4 animate-spin" />}
      <LogOut className="mr-2" /> {t('text')}
    </Button>
  );
}
