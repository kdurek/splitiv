import { queryOptions } from "@tanstack/react-query";

import { $getGroupsData } from "./functions";

export const groupsQueryOptions = () =>
  queryOptions({
    queryKey: ["groups"],
    queryFn: ({ signal }) => $getGroupsData({ signal }),
  });
