import { BugIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Error({ className }: { className?: string }) {
  return <BugIcon className={cn('text-primary-100 size-16', className)} />;
}

export function FullScreenError({ className }: { className?: string }) {
  return (
    <div className={cn('fixed inset-0 flex items-center justify-center md:absolute', className)}>
      <Error />
    </div>
  );
}
