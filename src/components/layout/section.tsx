import { type ReactNode } from 'react';

import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: ReactNode;
  title?: string | null;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div>
      {title && (
        <Heading variant="h1" className="p-4">
          {title}
        </Heading>
      )}
      <section className={cn('p-4', title && 'pt-0')}>{children}</section>
    </div>
  );
}
