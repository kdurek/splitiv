"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import superjson from "superjson";

import { api } from "utils/api";

type NextAuthProviderProps = {
  children: React.ReactNode;
};

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

type TrpcProviderProps = {
  children: React.ReactNode;
};

export function TrpcProvider({ children }: TrpcProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  const getBaseUrl = () => {
    if (typeof window !== "undefined") return ""; // browser should use relative url
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
  };

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
