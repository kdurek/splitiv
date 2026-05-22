import { queryOptions } from "@tanstack/react-query";

import { $getDashboardBalance } from "./functions";

export const dashboardBalanceQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard-balance"],
    queryFn: ({ signal }) => $getDashboardBalance({ signal }),
  });
