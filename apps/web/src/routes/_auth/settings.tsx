import { createFileRoute } from "@tanstack/react-router";

import { groupsQueryOptions } from "#/groups/queries";
import { SettingsPanel } from "#/settings/pages/settings-panel";

export const Route = createFileRoute("/_auth/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: SettingsPanel,
});
