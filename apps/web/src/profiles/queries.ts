import { queryOptions } from "@tanstack/react-query";

import { $getProfile } from "./functions";

export const profileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: ({ signal }) => $getProfile({ data: { userId }, signal }),
  });
