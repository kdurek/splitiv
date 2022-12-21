import { trpc } from "utils/trpc";

function useUsers() {
  return trpc.users.getUsers.useQuery();
}

export { useUsers };
