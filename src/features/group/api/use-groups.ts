import { api } from "utils/api";

export function useGroups() {
  return api.group.getGroupsByMe.useQuery();
}
