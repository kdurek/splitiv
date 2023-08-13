import { Poppins } from "next/font/google";

import { TailwindIndicator } from "components/tailwind-indicator";

import { NextAuthProvider, TrpcProvider } from "./providers";

import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Splitiv",
  description: "Expense management",
  applicationName: "Splitiv",
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1B1E" },
  ],
};

const poppins = Poppins({
  subsets: ["latin-ext"],
  weight: ["400", "500", "700"],
  preload: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
