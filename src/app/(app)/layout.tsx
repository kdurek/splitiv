import { redirect } from 'next/navigation';

import { AppInit } from '@/components/layout/app-init';
import { MobileNav } from '@/components/layout/mobile-nav';
import { validateRequest } from '@/server/auth';
import { api } from '@/trpc/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  void api.user.current.prefetch();

  return (
    <AppInit user={user}>
      {children}
      <MobileNav />
    </AppInit>
  );
}
