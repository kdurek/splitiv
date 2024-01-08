'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChangeCurrentGroup } from '@/hooks/use-change-current-group';
import { type GroupList } from '@/trpc/shared';

interface GroupSelectProps {
  activeGroupId?: string;
  groups: GroupList;
}

export function GroupSelect({ activeGroupId, groups }: GroupSelectProps) {
  const { mutate: changeActiveGroup } = useChangeCurrentGroup();

  const handleGroupSelect = (value: string) => {
    changeActiveGroup({ groupId: value });
  };

  if (groups.length === 0) {
    return (
      <div className="text-center">
        Wygląda na to, że nie należysz do żadnej grupy <br />
        Poproś właściciela o zaproszenie
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Wybierz grupę aby przejść dalej</Label>
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
    </div>
  );
}
