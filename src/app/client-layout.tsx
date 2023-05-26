"use client";

import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { setCookie } from "cookies-next";
import dayjs from "dayjs";
import { useState } from "react";

import { ActiveGroupProvider } from "features/group";
import { Layout } from "features/layout";

import { NextAuthProvider, TrpcProvider } from "./providers";

import type { ColorScheme } from "@mantine/core";

import "dayjs/locale/pl";

export default function ClientRootLayout({
  defaultColorScheme,
  children,
}: {
  defaultColorScheme?: string;
  children: React.ReactNode;
}) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    defaultColorScheme === "dark" ? "dark" : "light"
  );

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  dayjs.locale("pl");

  return (
    <NextAuthProvider>
      <TrpcProvider>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme,
              fontFamily: "Poppins, sans-serif",
              headings: { fontFamily: "Poppins, sans-serif" },
            }}
          >
            <ActiveGroupProvider>
              <Layout>{children}</Layout>
            </ActiveGroupProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </TrpcProvider>
    </NextAuthProvider>
  );
}
