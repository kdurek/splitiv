import { api } from "utils/api";

export function useTasksByGroup(groupId: string | undefined) {
  if (!groupId) {
    throw new Error("groupId not defined");
  }

  return api.task.getTasksByGroup.useQuery(
    { groupId },
    { enabled: Boolean(groupId) }
  );
}
