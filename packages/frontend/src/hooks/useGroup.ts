import { trpc } from "utils/trpc";

function useGroup(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return trpc.groups.getGroupById.useQuery(
    { groupId },
    {
      enabled: Boolean(groupId),
    }
  );
}

export { useGroup };