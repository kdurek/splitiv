import { api } from "utils/api";

function useUsers() {
  return api.user.getUsers.useQuery();
}

export { useUsers };
