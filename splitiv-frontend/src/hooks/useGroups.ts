import { trpc } from "utils/trpc";

function useGroups() {
  return trpc.groups.getGroupsByMe.useQuery();
}

export { useGroups };
