import { useAuth0 } from "@auth0/auth0-react";

import { trpc } from "utils/trpc";

function useCurrentUser() {
  const { isAuthenticated } = useAuth0();

  return trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: isAuthenticated,
  });
}

export { useCurrentUser };
