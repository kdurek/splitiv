import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/server/auth';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: headers(),
  });
  if (session) {
    return redirect('/');
  }

  return <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">{children}</main>;
}
