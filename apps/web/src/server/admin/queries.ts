import { queryOptions } from "@tanstack/react-query";

import { $getAdminBalance } from "./functions";

export const adminBalanceQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-balance"],
    queryFn: ({ signal }) => $getAdminBalance({ signal }),
  });
