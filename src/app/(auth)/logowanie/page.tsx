import { redirect } from 'next/navigation';

import { LoginButton } from '@/components/auth/login-button';
import { validateRequest } from '@/server/auth';

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-4 rounded-md border p-4">
        <h1 className="max-w-md">Aby przejść dalej, zaloguj się</h1>
        <LoginButton />
      </div>
    </div>
  );
}
