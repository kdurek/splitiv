'use client';

import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';

export function LogoutButton() {
  const t = useTranslations('LogoutButton');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: logout } = api.auth.logout.useMutation({
    onSuccess() {
      queryClient.clear();
      router.push('/logowanie');
      router.refresh();
    },
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <Button type="button" onClick={handleLogout} variant="outline" className="w-full">
      <LogOut className="mr-2" /> {t('text')}
    </Button>
  );
}
