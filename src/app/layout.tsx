import { Poppins } from "next/font/google";
import { cookies } from "next/headers";

import ClientRootLayout from "./client-layout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Splitiv",
  themeColor: "#1A1B1E",
  manifest: "/manifest.json",
  icons: [
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icon-192x192.png" },
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
  const cookieStore = cookies();
  const defaultColorScheme = cookieStore.get("mantine-color-scheme")?.value;

  return (
    <html lang="pl" className={poppins.className}>
      <body>
        <ClientRootLayout defaultColorScheme={defaultColorScheme}>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  );
}
