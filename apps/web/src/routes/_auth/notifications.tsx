import { createFileRoute } from "@tanstack/react-router";

import { NotificationsList } from "~/notifications/components/notifications-list";
import { notificationsQueryOptions } from "~/notifications/queries";

export const Route = createFileRoute("/_auth/notifications")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQueryOptions()),
  component: NotificationsList,
});
