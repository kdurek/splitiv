import { redirect } from 'next/navigation';

import { AppInit } from '@/components/layout/app-init';
import { MobileNav } from '@/components/layout/mobile-nav';
import { validateRequest } from '@/server/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <AppInit user={user}>
      {children}
      <MobileNav />
    </AppInit>
  );
}
