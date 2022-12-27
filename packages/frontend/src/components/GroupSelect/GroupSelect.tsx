import { Select } from "@chakra-ui/react";
import { ChangeEvent } from "react";

import { useGroups } from "hooks/useGroups";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function GroupSelect() {
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { activeGroupId, setActiveGroupId } = useActiveGroup();

  const handleSetActiveGroupId = (event: ChangeEvent<HTMLSelectElement>) =>
    setActiveGroupId(event.target.value);

  return (
    <Select
      onChange={handleSetActiveGroupId}
      value={activeGroupId}
      disabled={isLoadingGroups}
      size="lg"
      variant="outline"
    >
      {groups?.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </Select>
  );
}

export default GroupSelect;
