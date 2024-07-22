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
      <div className="min-h-dvh pb-20">{children}</div>
      <div className="fixed bottom-0 z-40 h-20 w-full rounded-t-md bg-background shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <MobileNav />
      </div>
    </AppInit>
  );
}
