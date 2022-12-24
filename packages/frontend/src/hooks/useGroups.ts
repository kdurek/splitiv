import { trpc } from "utils/trpc";

function useGroups() {
  return trpc.group.getGroupsByMe.useQuery();
}

export { useGroups };
