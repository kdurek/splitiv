import { NativeSelect } from "@mantine/core";

import { useGroups } from "features/group/api/use-groups";

import { useActiveGroup } from "../active-group.context";

export function GroupSelect() {
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { activeGroupId, setActiveGroupId } = useActiveGroup();

  if (!groups) return null;

  return (
    <NativeSelect
      onChange={(event) => setActiveGroupId(event.currentTarget.value)}
      value={activeGroupId}
      disabled={isLoadingGroups}
      data={groups.map((group) => {
        return { value: group.id, label: group.name };
      })}
    />
  );
}
