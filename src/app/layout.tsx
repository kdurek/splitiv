/* eslint-disable import/no-duplicates */
import '@/styles/globals.css';

import { setDefaultOptions } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import Script from 'next/script';

import { TailwindIndicator } from '@/components/layout/tailwind-indicator';
import { Toaster } from '@/components/ui/sonner';
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
  themeColor: '#F5F5F5',
};

const poppins = Poppins({
  subsets: ['latin-ext'],
  weight: ['400', '500', '600', '700'],
});

const dataWebsiteId =
  process.env.NODE_ENV === 'production'
    ? '225083f2-01a5-456e-afa3-f3ed5fd391fe'
    : '26894ae9-08bc-45e4-8d5d-f01b65062952';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={poppins.className}>
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster />
          <TailwindIndicator />
        </TRPCReactProvider>
      </body>
      <Script defer src="https://analytics.durek.pl/script.js" data-website-id={dataWebsiteId} />
    </html>
  );
}
