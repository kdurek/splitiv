import { type ReactNode } from 'react';

import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { HydrateClient } from '@/trpc/server';

interface SectionProps {
  children: ReactNode;
  title?: string | null;
  className?: HTMLDivElement['className'];
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <HydrateClient>
      {title && (
        <Heading variant="h1" className="p-4">
          {title}
        </Heading>
      )}
      <section className={cn('p-4', title && 'pt-0', className)}>{children}</section>
    </HydrateClient>
  );
}
