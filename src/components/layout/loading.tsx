import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Loader({ className }: { className?: string }) {
  return <Loader2Icon className={cn('size-16 animate-spin text-primary/50', className)} />;
}

export function FullScreenLoading({ className }: { className?: string }) {
  return (
    <div className={cn('fixed inset-0 flex items-center justify-center', className)}>
      <Loader />
    </div>
  );
}
