/* eslint-disable import/no-duplicates */
import './globals.css';

import { setDefaultOptions } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import { TailwindIndicator } from '@/components/layout/tailwind-indicator';

import { NextAuthProvider, TrpcProvider } from './providers';

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
  weight: ['400', '500', '700'],
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={poppins.className}>
      <body>
        <NextAuthProvider>
          <TrpcProvider>
            {children}
            <TailwindIndicator />
          </TrpcProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
