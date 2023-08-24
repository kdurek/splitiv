import type { ReactNode } from 'react';

import { Heading } from './ui/heading';

interface SectionProps {
  children: ReactNode;
  title?: string | null;
}

export function Section({ title, children }: SectionProps) {
  return (
    <>
      <Heading variant="h1">{title}</Heading>
      <section className="mt-4">{children}</section>
    </>
  );
}
