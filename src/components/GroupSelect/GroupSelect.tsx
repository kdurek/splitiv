import { NativeSelect } from "@mantine/core";

import { useGroups } from "hooks/useGroups";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function GroupSelect() {
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

export default GroupSelect;
