import { api } from "utils/api";

function useGroup(groupId: string) {
  return api.group.getGroupById.useQuery(
    { groupId },
    {
      enabled: Boolean(groupId),
    }
  );
}

export { useGroup };
