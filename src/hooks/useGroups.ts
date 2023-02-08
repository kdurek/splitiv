import { api } from "utils/api";

function useGroups() {
  return api.group.getGroupsByMe.useQuery();
}

export { useGroups };
