'use client';

import { setDefaultOptions } from 'date-fns';
import { pl } from 'date-fns/locale';

setDefaultOptions({
  locale: pl,
});

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
