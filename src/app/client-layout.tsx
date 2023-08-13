"use client";

import { MantineProvider } from "@mantine/core";
import dayjs from "dayjs";

import "dayjs/locale/pl";

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  dayjs.locale("pl");

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        fontFamily: "Poppins, sans-serif",
        headings: { fontFamily: "Poppins, sans-serif" },
      }}
    >
      {children}
    </MantineProvider>
  );
}
