import { type ReactNode, Suspense } from 'react';

import FullScreenLoading from '@/app/_components/layout/loading';
import { Heading } from '@/app/_components/ui/heading';
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
      <section className={cn('p-4', title && 'pt-0')}>
        <Suspense fallback={<FullScreenLoading />}>{children}</Suspense>
      </section>
    </div>
  );
}
