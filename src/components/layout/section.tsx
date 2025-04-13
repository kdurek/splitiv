import * as React from 'react';

import { cn } from '@/lib/utils';

const Section = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mx-auto max-w-lg rounded-lg bg-card text-card-foreground', className)} {...props} />
  ),
);
Section.displayName = 'Section';

const SectionHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />,
);
SectionHeader.displayName = 'SectionHeader';

const SectionTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl leading-none font-semibold tracking-tight', className)} {...props} />
  ),
);
SectionTitle.displayName = 'SectionTitle';

const SectionDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
SectionDescription.displayName = 'SectionDescription';

const SectionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />,
);
SectionContent.displayName = 'SectionContent';

const SectionFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-4 pt-0', className)} {...props} />
  ),
);
SectionFooter.displayName = 'SectionFooter';

export { Section, SectionContent, SectionDescription, SectionFooter, SectionHeader, SectionTitle };
