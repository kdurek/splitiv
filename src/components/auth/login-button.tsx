import { LogIn } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LoginButton() {
  return (
    <Link href="/api/auth" className={cn(buttonVariants(), 'w-full')}>
      <LogIn className="mr-2" /> Zaloguj
    </Link>
  );
}
