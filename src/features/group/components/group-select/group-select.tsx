import { NativeSelect } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

import { useGroups } from "features/group/api/use-groups";

export function GroupSelect() {
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const [activeGroupId, setActiveGroupId] = useLocalStorage({
    key: "activeGroupId",
  });

  return (
    <NativeSelect
      onChange={(event) => setActiveGroupId(event.currentTarget.value)}
      value={activeGroupId}
      disabled={isLoadingGroups}
      data={
        groups?.map((group) => {
          return { value: group.id, label: group.name };
        }) || []
      }
    />
  );
}
