import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const headingVariants = cva('', {
  variants: {
    variant: {
      p: '',
      h1: 'text-3xl font-bold tracking-tight',
      h2: 'text-xl font-bold tracking-tight',
      h3: 'text-xl font-medium tracking-tight',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(({ className, variant, ...props }, ref) => {
  const Comp = variant ?? 'p';
  return <Comp className={cn(headingVariants({ variant, className }))} ref={ref} {...props} />;
});
Heading.displayName = 'Heading';

export { Heading };
