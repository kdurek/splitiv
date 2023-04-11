import { api } from "utils/api";

export function useGroup(groupId: string) {
  return api.group.getGroupById.useQuery(
    { groupId },
    {
      enabled: Boolean(groupId),
    }
  );
}
