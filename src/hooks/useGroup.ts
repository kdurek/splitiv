import { api } from "utils/api";

function useGroup(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return api.group.getGroupById.useQuery(
    { groupId },
    {
      enabled: Boolean(groupId),
    }
  );
}

export { useGroup };
