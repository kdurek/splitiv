import { mutationOptions } from "@tanstack/react-query";

import { $addMemberByEmail, $setActiveGroup } from "./functions";

export const setActiveGroupMutationOptions = () =>
  mutationOptions({
    mutationFn: (groupId: string) => $setActiveGroup({ data: { groupId } }),
  });

export const addMemberByEmailMutationOptions = () =>
  mutationOptions({
    mutationFn: (email: string) => $addMemberByEmail({ data: { email } }),
  });
