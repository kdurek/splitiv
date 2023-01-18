import { useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";
import { ReactNode, useState } from "react";
import superjson from "superjson";

import { trpc } from "utils/trpc";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const { getAccessTokenSilently } = useAuth0();

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${import.meta.env.VITE_API_URL}/trpc`,
          async headers() {
            try {
              const accessToken = await getAccessTokenSilently();

              return {
                authorization: accessToken ? `Bearer ${accessToken}` : "",
              };
            } catch (error) {
              return {};
            }
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
