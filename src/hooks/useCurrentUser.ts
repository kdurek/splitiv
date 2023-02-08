import { useSession } from "next-auth/react";

import { api } from "utils/api";

function useCurrentUser() {
  const { status } = useSession();

  return api.user.getCurrentUser.useQuery(undefined, {
    enabled: Boolean(status === "authenticated"),
  });
}

export { useCurrentUser };
