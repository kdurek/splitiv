import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Poppins } from "@next/font/google";
import { getCookie, setCookie } from "cookies-next";
import dayjs from "dayjs";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

import { ActiveGroupProvider } from "providers/ActiveGroupProvider";
import { LayoutProvider } from "providers/LayoutProvider";

import { api } from "../utils/api";

import type { ColorScheme } from "@mantine/core";
import type { GetServerSidePropsContext, NextComponentType } from "next";
import type { Session } from "next-auth";

import "dayjs/locale/pl";

const poppins = Poppins({
  subsets: ["latin-ext"],
  weight: ["400", "500", "700"],
});

function MyApp({
  Component,
  pageProps: { defaultColorScheme, session, ...pageProps },
}: {
  Component: NextComponentType;
  pageProps: {
    defaultColorScheme: ColorScheme;
    session: Session | null;
  };
}) {
  const [colorScheme, setColorScheme] =
    useState<ColorScheme>(defaultColorScheme);

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
    <main className={poppins.className}>
      <SessionProvider session={session}>
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
            <LayoutProvider>
              <ActiveGroupProvider>
                <Head>
                  <title>Splitiv</title>
                </Head>
                <Component {...pageProps} />
              </ActiveGroupProvider>
            </LayoutProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </SessionProvider>
    </main>
  );
}

MyApp.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  const defaultColorScheme = getCookie("mantine-color-scheme", ctx) || "light";

  return {
    pageProps: {
      defaultColorScheme,
    },
  };
};

export default api.withTRPC(MyApp);
