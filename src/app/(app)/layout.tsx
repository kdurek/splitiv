import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppInit } from '@/components/layout/app-init';
import { MobileNav } from '@/components/layout/mobile-nav';
import { auth } from '@/server/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect('/logowanie');
  }

  return (
    <AppInit user={session.user}>
      {children}
      <MobileNav />
    </AppInit>
  );
}
