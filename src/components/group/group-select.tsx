'use client';

import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/trpc/react';

interface GroupSelectProps {
  onSuccess?: () => void;
}

export function GroupSelect({ onSuccess }: GroupSelectProps) {
  const [user] = api.user.current.useSuspenseQuery();
  const [groups] = api.group.list.useSuspenseQuery();

  const { mutate: changeActiveGroup } = api.group.changeCurrent.useMutation();

  const handleGroupSelect = (value: string) => {
    changeActiveGroup(
      { groupId: value },
      {
        onSuccess() {
          toast.success('Pomyślnie wybrano grupę');
          onSuccess?.();
        },
      },
    );
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
    <Select defaultValue={user?.activeGroupId ?? ''} onValueChange={handleGroupSelect}>
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
