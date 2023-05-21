import { api } from "utils/api";

export function useUsers() {
  return api.user.getAll.useQuery();
}
