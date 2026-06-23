import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "#/profiles/pages/profile";
import { profileQueryOptions } from "#/profiles/queries";

export const Route = createFileRoute("/_auth/profiles/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(profileQueryOptions(params.userId)),
  component: function ProfileRoute() {
    const { userId } = Route.useParams();
    return <ProfilePage userId={userId} />;
  },
});
