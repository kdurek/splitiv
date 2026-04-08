import { mutationOptions } from "@tanstack/react-query";

import { $addUserToActiveGroup, $setActiveGroup } from "./functions";

export const setActiveGroupMutationOptions = () =>
  mutationOptions({
    mutationFn: (groupId: string) => $setActiveGroup({ data: { groupId } }),
  });

export const addUserToActiveGroupMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      $addUserToActiveGroup({ data: { groupId, userId } }),
  });
