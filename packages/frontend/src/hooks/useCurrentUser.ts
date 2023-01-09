import { trpc } from "utils/trpc";

function useCurrentUser() {
  return trpc.user.getCurrentUser.useQuery();
}

export { useCurrentUser };
