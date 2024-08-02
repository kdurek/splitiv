import { redirect } from 'next/navigation';

import { validateRequest } from '@/server/auth';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }

  return <main className="mx-auto my-4 max-w-lg p-4">{children}</main>;
}
