import { trpc } from "utils/trpc";

function useUsers() {
  return trpc.user.getUsers.useQuery();
}

export { useUsers };
