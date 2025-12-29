import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@splitiv/api/routers/index";
import { env } from "@splitiv/env/web";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import Decimal from "decimal.js";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/rpc`,
  fetch(_url, options) {
    return fetch(_url, {
      ...options,
      credentials: "include",
    });
  },
  customJsonSerializers: [
    {
      type: 21,
      condition: (data) => Decimal.isDecimal(data),
      serialize: (data) => String(data),
      deserialize: (data) => new Decimal(data),
    },
  ],
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
