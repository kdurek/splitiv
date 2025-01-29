'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { authClient } from '@/lib/auth';

export function GoogleSignInButton() {
  const t = useTranslations('GoogleSignInButton');

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Button type="button" onClick={handleSignIn} className="w-full">
          {t('text')}
        </Button>
      </CardContent>
    </Card>
  );
}
