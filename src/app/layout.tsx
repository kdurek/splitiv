/* eslint-disable import/no-duplicates */
import '@/styles/globals.css';

import { setDefaultOptions } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { headers } from 'next/headers';
import Script from 'next/script';

import { TailwindIndicator } from '@/components/layout/tailwind-indicator';
import { TRPCReactProvider } from '@/trpc/react';

setDefaultOptions({
  locale: pl,
});

const APP_NAME = 'Splitiv';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Expense management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1B1E' },
  ],
};

const poppins = Poppins({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

/**
 * Since we're passing `headers()` to the `TRPCReactProvider` we need to
 * make the entire app dynamic. You can move the `TRPCReactProvider` further
 * down the tree (e.g. /dashboard and onwards) to make part of the app statically rendered.
 */
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`font-sans ${poppins.variable}`}>
      <body>
        <TRPCReactProvider headers={headers()}>
          {children}
          <TailwindIndicator />
        </TRPCReactProvider>
      </body>
      <Script async src="https://analytics.durek.pl/script.js" data-website-id="26894ae9-08bc-45e4-8d5d-f01b65062952" />
    </html>
  );
}
