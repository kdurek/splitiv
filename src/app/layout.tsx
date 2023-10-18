/* eslint-disable import/no-duplicates */
import '@/styles/globals.css';

import { setDefaultOptions } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { headers } from 'next/headers';
import Script from 'next/script';

import { TailwindIndicator } from '@/components/layout/tailwind-indicator';
import { TRPCReactProvider } from '@/trpc/react';

setDefaultOptions({
  locale: pl,
});

export const metadata: Metadata = {
  title: 'Splitiv',
  description: 'Expense management',
  applicationName: 'Splitiv',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1B1E' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

const poppins = Poppins({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`font-sans ${poppins.variable}`}>
      <body>
        <TRPCReactProvider headers={headers()}>
          {children}
          <TailwindIndicator />
        </TRPCReactProvider>
      </body>
      <Script async src="https://analytics.durek.pl/script.js" data-website-id="5b6221a6-86f7-4af7-be10-cab127922aad" />
    </html>
  );
}
