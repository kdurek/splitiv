import { trpc } from "utils/trpc";

function useTasksByGroup(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return trpc.task.getTasksByGroup.useQuery(
    { groupId },
    { enabled: Boolean(groupId) }
  );
}

export { useTasksByGroup };
