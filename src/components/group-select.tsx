'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { useChangeCurrentGroup } from 'hooks/use-change-current-group';
import { type GetGroups } from 'utils/api';

interface GroupSelectProps {
  activeGroupId?: string;
  groups: GetGroups;
}

export function GroupSelect({ activeGroupId, groups }: GroupSelectProps) {
  const { mutate: changeActiveGroup } = useChangeCurrentGroup();

  const handleGroupSelect = (value: string) => {
    changeActiveGroup({ groupId: value });
  };

  return (
    <Select defaultValue={activeGroupId} onValueChange={handleGroupSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Wybierz grupę" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
