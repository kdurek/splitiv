import { createFileRoute } from "@tanstack/react-router";

import { GroupSelect } from "~/groups/components/group-select";
import { groupsQueryOptions } from "~/groups/queries";

export const Route = createFileRoute("/_auth/group/select")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: GroupSelect,
});
