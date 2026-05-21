import { createFileRoute } from "@tanstack/react-router";

import { groupsQueryOptions } from "~/groups/functions";
import { SettingsPanel } from "~/settings/components/settings-panel";

export const Route = createFileRoute("/_auth/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SettingsPanel,
});
